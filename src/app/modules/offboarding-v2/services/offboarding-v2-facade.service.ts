import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  defer,
  forkJoin,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError
} from 'rxjs';
import {
  CreateOffboardingPayload,
  EmployeeSnapshot,
  OffboardingCase,
  OffboardingCaseSummary,
  OffboardingStatus,
  OffboardingType
} from '../models/offboarding-case.model';
import { EmployeeSummary } from '../models/employee-summary.model';
import { OffboardingTask, TaskCompletionPayload } from '../models/offboarding-task.model';
import {
  AssetAcknowledgePayload,
  AssetReturnPayload,
  OffboardingAsset
} from '../models/offboarding-asset.model';
import {
  ExitInterviewResponse,
  ExitInterviewSubmitPayload
} from '../models/exit-interview.model';
import { WorkflowStatus } from '../models/workflow-status.model';
import { OffboardingEvent } from '../models/offboarding-event.model';
import {
  AttemptCompletionResponse,
  OffboardingV2ApiService
} from './offboarding-v2-api.service';
import {
  OffboardingAnalytics,
  OffboardingV2MockStore
} from './offboarding-v2-mock.store';
import { UserContextService } from './user-context.service';

@Injectable()
export class OffboardingV2FacadeService {
  
  private readonly warnedEndpoints = new Set<string>();
  private readonly requestsRefresh$ = new BehaviorSubject<void>(undefined);
  private employeesSubject = new BehaviorSubject<EmployeeSummary[]>([]);
  public readonly employeesForSelect$ = this.employeesSubject.asObservable();
  readonly requests$: Observable<OffboardingCaseSummary[]>;

  constructor(
    private readonly api: OffboardingV2ApiService,
    private readonly mock: OffboardingV2MockStore,
    private readonly userContext: UserContextService
  ) {
    this.employeesForSelect$ = this.userContext.visibleEmployees$.pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.requests$ = combineLatest([
      this.userContext.isHR$,
      this.userContext.visibleEmployeeIds$,
      this.requestsRefresh$
    ]).pipe(
      switchMap(([isHR, employeeIds]) => this.loadScopedRequests(isHR, employeeIds)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  createOffboarding(payload: CreateOffboardingPayload): Observable<OffboardingCase> {
    return this.withFallback(
      '/offboarding/create',
      this.api.createOffboarding(payload).pipe(
        switchMap((created) =>
          this.getEmployee(created.employeeId).pipe(map((employee) => ({ ...created, employee })))
        )
      ),
      () => this.mock.createOffboarding(payload)
    ).pipe(
      map((created) => this.normalizeCase(created)),
      tap((created) => {
        this.requestsRefresh$.next(undefined);
      })
    );
  }

  getEmployee(employeeId: string): Observable<EmployeeSnapshot> {
    return this.withFallback(
      '/offboarding/employee/{employeeId}',
      this.api.getEmployee(employeeId),
      () => this.mock.getEmployee(employeeId)
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  getCase(offboardingId: string): Observable<OffboardingCase> {
    return this.withFallback(
      '/offboarding/{offboardingId}',
      this.api.getCase(offboardingId),
      () => this.mock.getCase(offboardingId)
    ).pipe(map((item) => this.normalizeCase(item)));
  }

  getTasks(offboardingId: string): Observable<OffboardingTask[]> {
    return this.withFallback(
      '/offboarding-tasks/offboarding/{offboardingId}',
      this.api.getTasks(offboardingId),
      () => this.mock.getTasks(offboardingId)
    ).pipe(map((items) => this.normalizeTasks(items, offboardingId)));
  }

  completeTask(taskId: string, payload: TaskCompletionPayload): Observable<OffboardingTask> {
    return this.withFallback(
      '/offboarding-tasks/{taskId}/complete',
      this.api.completeTask(taskId, payload),
      () => this.mock.completeTask(taskId, payload)
    );
  }

  getExitInterview(offboardingId: string): Observable<ExitInterviewResponse> {
    return this.withFallback(
      '/exit-interview/{offboardingId}',
      this.api.getExitInterview(offboardingId),
      () => this.mock.getExitInterview(offboardingId)
    );
  }

  submitExitInterview(
    offboardingId: string,
    payload: ExitInterviewSubmitPayload
  ): Observable<ExitInterviewResponse> {
    return this.withFallback(
      '/exit-interview/{offboardingId}/submit',
      this.api.submitExitInterview(offboardingId, payload),
      () => this.mock.submitExitInterview(offboardingId, payload)
    );
  }

  getPendingAssets(employeeId: string): Observable<OffboardingAsset[]> {
    return this.withFallback(
      '/employee-asset-notes/employee/{employeeId}/unreturned',
      this.api.getPendingAssets(employeeId),
      () => this.mock.getAssets(employeeId)
    ).pipe(map((items) => this.normalizeAssets(items, employeeId)));
  }

  returnAsset(assetNoteId: string, payload: AssetReturnPayload): Observable<OffboardingAsset> {
    return this.withFallback(
      '/employee-asset-notes/{assetNoteId}/return',
      this.api.returnAsset(assetNoteId, payload),
      () => this.mock.returnAsset(assetNoteId, payload)
    );
  }

  acknowledgeAsset(
    assetNoteId: string,
    payload: AssetAcknowledgePayload
  ): Observable<OffboardingAsset> {
    return this.withFallback(
      '/employee-asset-notes/{assetNoteId}/acknowledge',
      this.api.acknowledgeAsset(assetNoteId, payload),
      () => this.mock.acknowledgeAsset(assetNoteId, payload)
    );
  }

  private normalizeAssets(items: OffboardingAsset[], fallbackEmployeeId: string): OffboardingAsset[] {
    type RawAsset = OffboardingAsset & {
      id?: string | number;
      employee?: { id?: string | number };
      returned?: boolean | null;
    };

    return (items as RawAsset[]).map((item, index) => {
      const resolvedAssetNoteId = String(item.assetNoteId || item.id || `${fallbackEmployeeId}-A-${index + 1}`);
      const resolvedEmployeeId = String(item.employeeId || item.employee?.id || fallbackEmployeeId || '');
      const returned =
        typeof item.returned === 'boolean'
          ? item.returned
          : item.returnStatus
            ? item.returnStatus !== 'NOT_RETURNED'
            : false;

      return {
        ...item,
        assetNoteId: resolvedAssetNoteId,
        employeeId: resolvedEmployeeId,
        assetId: String(item.assetId || item.serialNumber || resolvedAssetNoteId),
        returnStatus: returned ? 'RETURNED' : 'NOT_RETURNED',
        returned
      };
    });
  }

  getWorkflowStatus(offboardingId: string): Observable<WorkflowStatus> {
    return this.withFallback(
      '/offboarding/{offboardingId}/workflow-status',
      this.api.getWorkflowStatus(offboardingId),
      () => this.mock.getWorkflowStatus(offboardingId)
    );
  }

  attemptComplete(offboardingId: string): Observable<AttemptCompletionResponse> {
    return this.withFallback(
      '/offboarding/{offboardingId}/attempt-complete',
      this.api.attemptComplete(offboardingId),
      () => this.mock.attemptComplete(offboardingId)
    );
  }

  getEvents(offboardingId: string): Observable<OffboardingEvent[]> {
    return this.withFallback(
      '/offboarding-events/offboarding/{offboardingId}',
      this.api.getEvents(offboardingId),
      () => this.mock.getEvents(offboardingId)
    );
  }

  getAnalytics(scopedEmployeeIds?: string[]): Observable<OffboardingAnalytics> {
    return this.userContext.isHR$.pipe(
      switchMap((isHR) => {
        if (isHR) {
          return this.mock.getAnalytics();
        }
        return this.userContext.visibleEmployeeIds$.pipe(
          switchMap((ids) => this.mock.getAnalytics(scopedEmployeeIds || ids))
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  canViewEmployee(employeeId: string): Observable<boolean> {
    // Temporary behavior requested: allow viewing any case regardless of user scope.
    void employeeId;
    return of(true);
  }

  private loadScopedRequests(
    isHR: boolean,
    employeeIds: string[]
  ): Observable<OffboardingCaseSummary[]> {
    // Temporary behavior requested: render all requests regardless of user scope.
    // Keep signature unchanged to avoid touching callers.
    void isHR;
    void employeeIds;
    return this.withFallback(
      '/offboarding',
      this.api.getAllCases(),
      () => this.mock.getAllOffboardingCases()
    ).pipe(
      map((rows) => this.normalizeSummaries(rows)),
      map((rows) => this.uniqueByCaseId(rows))
    );
  }

  private uniqueByCaseId(items: OffboardingCaseSummary[]): OffboardingCaseSummary[] {
    const mapById = new Map<string, OffboardingCaseSummary>();
    for (const item of items) {
      mapById.set(item.caseId, item);
    }
    return Array.from(mapById.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private normalizeCase(item: OffboardingCase): OffboardingCase {
    const raw = item as OffboardingCase & {
      id?: string | number;
      employee?: { id?: string | number; employeeId?: string | number };
      offboardingStatus?: string;
    };
    const resolvedId = String(item.offboardingId || item.caseId || raw.id || '');
    const resolvedEmployeeId = String(
      item.employeeId || raw.employee?.employeeId || raw.employee?.id || ''
    );
    const numericOffboardingId = Number(raw.id ?? item.id);
    return {
      ...item,
      id: resolvedId,
      offboardingId: resolvedId,
      offboardingRecordId: Number.isNaN(numericOffboardingId) ? undefined : numericOffboardingId,
      offboardingStatus: String(raw.offboardingStatus || item.status || 'INITIATED'),
      caseId: String(item.caseId || resolvedId),
      employeeId: resolvedEmployeeId,
      offboardingType: (item.offboardingType || 'RESIGNATION') as OffboardingType,
      status: (raw.offboardingStatus || item.status || 'INITIATED') as OffboardingStatus,
      lastWorkingDate: item.lastWorkingDate || (item as { exitDate?: string }).exitDate || '',
      employee: {
        ...item.employee,
        employeeId: String(item.employee?.employeeId || raw.employee?.id || resolvedEmployeeId)
      }
    };
  }

  private normalizeSummaries(items: OffboardingCaseSummary[]): OffboardingCaseSummary[] {
    return items
      .map((item) => ({
        id: String(
          item.id || item.offboardingId || item.caseId || (item as { id?: string | number }).id || ''
        ),
        offboardingId: String(
          item.offboardingId || item.caseId || item.id || (item as { id?: string | number }).id || ''
        ),
        offboardingRecordId: Number.isNaN(Number((item as { id?: string | number }).id))
          ? undefined
          : Number((item as { id?: string | number }).id),
        caseId: String(
          item.caseId || item.offboardingId || item.id || (item as { id?: string | number }).id || ''
        ),
        employeeId: String(
          item.employeeId ||
            (item as { employee?: { employeeId?: string | number; id?: string | number } }).employee
              ?.employeeId ||
            (item as { employee?: { id?: string | number } }).employee?.id ||
            ''
        ),
        employeeName:
          item.employeeName ||
          (item as { employee?: { fullName?: string } }).employee?.fullName ||
          `${(item as { employee?: { firstName?: string } }).employee?.firstName || ''} ${(item as { employee?: { lastName?: string } }).employee?.lastName || ''}`.trim() ||
          '-',
        employeeNumber:
          item.employeeNumber ||
          (item as { employee?: { employeeNumber?: string } }).employee?.employeeNumber ||
          '-',
        department:
          item.department ||
          (item as { employee?: { department?: string } }).employee?.department ||
          (item as { employee?: { organizationalUnit?: { name?: string } } }).employee
            ?.organizationalUnit?.name ||
          '-',
        offboardingType: (item.offboardingType || 'RESIGNATION') as OffboardingType,
        lastWorkingDate:
          item.lastWorkingDate ||
          (item as { lastWorkingDay?: string; exitDate?: string }).lastWorkingDay ||
          (item as { exitDate?: string }).exitDate ||
          '-',
        status: (item.status ||
          (item as { offboardingStatus?: string }).offboardingStatus ||
          (item as { approvalStatus?: string }).approvalStatus ||
          'INITIATED') as OffboardingStatus,
        createdAt:
          item.createdAt ||
          (item as { createdOn?: string }).createdOn ||
          new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private normalizeTasks(items: OffboardingTask[], offboardingId: string): OffboardingTask[] {
    const mapDepartment = (value: string): OffboardingTask['department'] => {
      const normalized = String(value || '').toUpperCase().replace(/\s+/g, '_');
      if (normalized === 'LINE_MANAGER') {
        return 'LINE_MANAGER';
      }
      if (normalized === 'OPERATIONS') {
        return 'OPERATIONS';
      }
      if (normalized === 'FINANCE') {
        return 'FINANCE';
      }
      if (normalized === 'IT') {
        return 'IT';
      }
      return 'HR';
    };

    type RawTask = OffboardingTask & {
      id?: string | number;
      offboarding?: { id?: string | number };
      departmentName?: string;
      completed?: boolean;
      taskOwner?: unknown;
      taskDeadline?: string | null;
    };

    return (items as RawTask[]).map((item, index) => {
      const resolvedDepartment = mapDepartment(item.department || item.departmentName || 'HR');
      const completed =
        item.completionStatus === 'COMPLETED' || item.completed === true;
      const ownerRaw = item.taskOwner;
      const ownerObject =
        ownerRaw && typeof ownerRaw === 'object'
          ? (ownerRaw as {
              id?: string | number;
              firstName?: string;
              lastName?: string;
              employeeNumber?: string;
            })
          : undefined;
      const ownerFromObject = `${ownerObject?.firstName || ''} ${ownerObject?.lastName || ''}`.trim();
      const ownerId = Number(ownerObject?.id ?? item.taskOwnerId ?? 0);

      return {
        taskId: String(item.taskId || item.id || `${offboardingId}-T-${index + 1}`),
        offboardingId: String(item.offboardingId || item.offboarding?.id || offboardingId),
        department: resolvedDepartment,
        taskName: item.taskName || (item as { taskName?: string }).taskName || '-',
        taskOwnerId: Number.isNaN(ownerId) ? 0 : ownerId,
        taskOwnerEmployeeId: Number.isNaN(ownerId) ? undefined : ownerId,
        taskOwner:
          ownerFromObject ||
          (typeof ownerRaw === 'string' ? ownerRaw : '') ||
          ownerObject?.employeeNumber ||
          String(item.taskOwnerId || `${resolvedDepartment} Owner`),
        taskDeadline: String(item.taskDeadline || '-'),
        completionStatus: completed ? 'COMPLETED' : 'OPEN',
        completionDate: item.completionDate || undefined,
        evidenceFilePath: item.evidenceFilePath || undefined,
        systemName: item.systemName || undefined,
        accessRevoked: item.accessRevoked,
        comment: item.comment || undefined
      };
    });
  }

  private withFallback<T>(
    endpointKey: string,
    apiCall$: Observable<T>,
    fallbackFactory: () => Observable<T>
  ): Observable<T> {
    return defer(() => apiCall$).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse || error instanceof Error) {
          if (!this.warnedEndpoints.has(endpointKey)) {
            this.warnedEndpoints.add(endpointKey);
            console.warn(`[offboarding-v2] Falling back to in-memory mock for ${endpointKey}`, error);
          }
          return fallbackFactory();
        }
        return throwError(() => error);
      })
    );
  }
}
