import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import {
  EMPTY,
  Subscription,
  Subject,
  combineLatest,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  take,
  takeUntil
} from 'rxjs';
import {
  AssetAcknowledgePayload,
  AssetReturnPayload,
  OffboardingAsset
} from '../../models/offboarding-asset.model';
import {
  ExitInterviewResponse,
  ExitInterviewSubmitPayload
} from '../../models/exit-interview.model';
import {
  CreateOffboardingPayload,
  InitiatorType,
  OffboardingCase,
  OffboardingType,
  OffboardingStatus
} from '../../models/offboarding-case.model';
import { OffboardingEvent } from '../../models/offboarding-event.model';
import { OffboardingTask, TaskCompletionPayload } from '../../models/offboarding-task.model';
import { WorkflowStatus } from '../../models/workflow-status.model';
import { EmployeeSummary } from '../../models/employee-summary.model';
import { OffboardingV2FacadeService } from '../../services/offboarding-v2-facade.service';
import { UserContextService } from '../../services/user-context.service';

interface CaseVm {
  caseData: OffboardingCase;
  tasks: OffboardingTask[];
  assets: OffboardingAsset[];
  exitInterview: ExitInterviewResponse;
  workflow: WorkflowStatus;
  events: OffboardingEvent[];
}

interface TimelineItemVm {
  title: string;
  actor: string;
  timestamp: string;
  status?: string;
  comment?: string;
}

interface TaskCompleteFormModel {
  systemName: FormControl<string>;
  evidenceFilePath: FormControl<string>;
  comment: FormControl<string | null>;
}

interface AssetActionFormModel {
  returnedState: FormControl<'RETURNED' | 'NOT_RETURNED'>;
  conditionOnReturn: FormControl<string>;
  evidenceFilePath: FormControl<string>;
  remarks: FormControl<string | null>;
}

interface CreateCaseFormModel {
  employeeId: FormControl<string>;
  initiator: FormControl<'HR' | 'LINE_MANAGER' | 'SYSTEM_TRIGGERED' | 'EMPLOYEE_SELF_SERVICE'>;
  exitType: FormControl<
    | 'RESIGNATION'
    | 'RETIREMENT'
    | 'DISMISSAL'
    | 'CONTRACT_EXPIRY'
    | 'RETRENCHMENT'
    | 'DEATH'
    | 'MUTUAL_SEPARATION'
  >;
  reason: FormControl<string>;
  comments: FormControl<string | null>;
  exitInterviewRequested: FormControl<boolean>;
  noticeStart: FormControl<string | null>;
  noticeEnd: FormControl<string | null>;
  lastWorkingDate: FormControl<string>;
}

@Component({
  selector: 'app-offboarding-case-page',
  standalone: false,
  templateUrl: './offboarding-case-page.component.html',
  styleUrl: './offboarding-case-page.component.scss'
})
export class OffboardingCasePageComponent implements OnInit, OnDestroy {
  loading = true;
  offboardingId = '';
  vm: CaseVm | null = null;
  isHR = false;
  selectedMainTab = 0;
  selectedDepartment = '';
  taskSearchTerm = '';

  taskDrawerVisible = false;
  taskSaving = false;
  selectedTask: OffboardingTask | null = null;
  taskEvidenceFiles: NzUploadFile[] = [];

  assetDrawerVisible = false;
  assetReturnDrawerVisible = false;
  assetAcknowledgeDrawerVisible = false;
  assetSaving = false;
  selectedAsset: OffboardingAsset | null = null;
  assetEvidenceFiles: NzUploadFile[] = [];
  interviewSaving = false;

  createCaseVisible = false;
  creatingCase = false;
  employees: EmployeeSummary[] = [];
  private currentUserEmployeeId = 0;

  readonly systemNameOptions = [
    'HRMS',
    'Payroll',
    'Email',
    'Active Directory',
    'VPN',
    'ERP',
    'CRM'
  ];

  readonly assetConditionOptions = ['Good', 'Fair', 'Damaged', 'Lost', 'Stolen', 'N/A'];
  private readonly returnedConditionOptions = ['Good', 'Fair', 'Damaged'];
  private readonly notReturnedConditionOptions = ['Lost', 'Stolen', 'N/A'];
  readonly initiatorOptions: Array<{ label: string; value: InitiatorType }> = [
    { label: 'HR', value: 'HR' },
    { label: 'Line Manager', value: 'LINE_MANAGER' },
    { label: 'System Triggered', value: 'SYSTEM_TRIGGERED' },
    { label: 'Employee Self Service', value: 'EMPLOYEE_SELF_SERVICE' }
  ];
  readonly exitTypeOptions: Array<{ label: string; value: OffboardingType }> = [
    { label: 'Resignation', value: 'RESIGNATION' },
    { label: 'Retirement', value: 'RETIREMENT' },
    { label: 'Dismissal', value: 'DISMISSAL' },
    { label: 'Contract Expiry', value: 'CONTRACT_EXPIRY' },
    { label: 'Retrenchment', value: 'RETRENCHMENT' },
    { label: 'Death', value: 'DEATH' },
    { label: 'Mutual Separation', value: 'MUTUAL_SEPARATION' }
  ];

  readonly taskCompleteForm: FormGroup<TaskCompleteFormModel>;
  readonly assetActionForm: FormGroup<AssetActionFormModel>;
  readonly createCaseForm: FormGroup<CreateCaseFormModel>;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly facade: OffboardingV2FacadeService,
    private readonly userContext: UserContextService,
    private readonly fb: FormBuilder,
    private readonly message: NzMessageService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.taskCompleteForm = this.fb.group<TaskCompleteFormModel>({
      systemName: this.fb.nonNullable.control('', [Validators.required]),
      evidenceFilePath: this.fb.nonNullable.control('', [Validators.required]),
      comment: this.fb.control<string | null>(null)
    });

    this.assetActionForm = this.fb.group<AssetActionFormModel>({
      returnedState: this.fb.nonNullable.control('RETURNED'),
      conditionOnReturn: this.fb.nonNullable.control('Good', [Validators.required]),
      evidenceFilePath: this.fb.nonNullable.control('', [Validators.required]),
      remarks: this.fb.control<string | null>(null)
    });

    this.createCaseForm = this.fb.group<CreateCaseFormModel>(
      {
        employeeId: this.fb.nonNullable.control('', [Validators.required]),
        initiator: this.fb.nonNullable.control('HR', [Validators.required]),
        exitType: this.fb.nonNullable.control('RESIGNATION', [Validators.required]),
        reason: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(400)]),
        comments: this.fb.control<string | null>(null),
        exitInterviewRequested: this.fb.nonNullable.control(true),
        noticeStart: this.fb.control<string | null>(null),
        noticeEnd: this.fb.control<string | null>(null),
        lastWorkingDate: this.fb.nonNullable.control('', [Validators.required])
      },
      { validators: this.dateRulesValidator }
    );
  }

  get caseStatus(): OffboardingStatus | string {
    return this.vm?.caseData?.offboardingStatus || this.vm?.caseData?.status || 'INITIATED';
  }

  get caseIdentifier(): string {
    return this.vm?.caseData?.caseId || this.offboardingId;
  }

  get statusTagColor(): string {
    const status = String(this.caseStatus).toUpperCase();
    if (status === 'COMPLETED' || status === 'CLOSED') return 'success';
    if (status === 'BLOCKED') return 'error';
    if (status === 'READY_FOR_COMPLETION') return 'processing';
    if (status === 'IN_PROGRESS') return 'processing';
    return 'default';
  }

  get allTasksCompleted(): boolean {
    const tasks = this.vm?.tasks || [];
    return tasks.length > 0 && tasks.every((task) => task.completionStatus === 'COMPLETED');
  }

  get isClosable(): boolean {
    const status = String(this.caseStatus).toUpperCase();
    return this.allTasksCompleted && status !== 'COMPLETED' && status !== 'CLOSED';
  }

  get departments(): string[] {
    const tasks = this.vm?.tasks || [];
    const values = [...new Set(tasks.map((task) => String(task.department || 'HR')))];
    return values.sort();
  }

  get pendingTasksForSelectedDepartment(): OffboardingTask[] {
    const tasks = this.vm?.tasks || [];
    return tasks.filter(
      (task) =>
        String(task.department) === this.selectedDepartment && task.completionStatus !== 'COMPLETED'
    );
  }

  get searchedPendingTasksForSelectedDepartment(): OffboardingTask[] {
    const query = this.taskSearchTerm.trim().toLowerCase();
    if (!query) {
      return this.pendingTasksForSelectedDepartment;
    }

    return this.pendingTasksForSelectedDepartment.filter((task) => {
      const text = [
        String(task.taskName || ''),
        String(task.taskOwner || ''),
        String(task.completionStatus || '')
      ]
        .join(' ')
        .toLowerCase();
      return text.includes(query);
    });
  }

  get selectedDepartmentTasks(): OffboardingTask[] {
    const tasks = this.vm?.tasks || [];
    return tasks.filter((task) => String(task.department) === this.selectedDepartment);
  }

  get selectedDepartmentTaskStats(): { total: number; completed: number; overdue: number } {
    const tasks = this.selectedDepartmentTasks;
    const now = Date.now();
    const completed = tasks.filter((task) => task.completionStatus === 'COMPLETED').length;
    const overdue = tasks.filter((task) => {
      if (!task.taskDeadline || task.completionStatus === 'COMPLETED') {
        return false;
      }
      const due = new Date(task.taskDeadline).getTime();
      return !Number.isNaN(due) && due < now;
    }).length;

    return {
      total: tasks.length,
      completed,
      overdue
    };
  }

  get overviewTimelineItems(): TimelineItemVm[] {
    return this.mapEventsToTimeline(this.vm?.events || []);
  }

  get selectedDepartmentTimelineItems(): TimelineItemVm[] {
    const departmentTasks = this.selectedDepartmentTasks;
    const taskEvents = (this.vm?.events || []).filter((event) => {
      if (event.entity !== 'TASK') {
        return false;
      }
      const text = `${event.action || ''} ${event.notes || ''} ${event.description || ''}`.toUpperCase();
      return departmentTasks.some((task) => {
        const taskName = String(task.taskName || '').toUpperCase();
        const taskOwner = String(task.taskOwner || '').toUpperCase();
        return (taskName && text.includes(taskName)) || (taskOwner && text.includes(taskOwner));
      });
    });

    if (taskEvents.length) {
      return this.mapEventsToTimeline(taskEvents);
    }

    return [...departmentTasks]
      .sort((left, right) => {
        const leftDate = new Date(left.completionDate || left.taskDeadline || 0).getTime();
        const rightDate = new Date(right.completionDate || right.taskDeadline || 0).getTime();
        return rightDate - leftDate;
      })
      .map((task) => ({
      title: task.taskName,
      actor: task.taskOwner,
      timestamp: task.completionDate || task.taskDeadline || '',
      status: task.completionStatus,
      comment: task.comment || undefined
      }));
  }

  get availableConditionOptions(): string[] {
    return this.assetActionForm.controls.returnedState.value === 'RETURNED'
      ? this.returnedConditionOptions
      : this.notReturnedConditionOptions;
  }

  get interviewCompleted(): boolean {
    return !!this.vm?.exitInterview?.submitted;
  }

  get interviewStatusLabel(): string {
    if (this.interviewCompleted) {
      return 'Completed';
    }
    if (this.vm?.caseData?.exitInterviewRequested === false) {
      return 'Not Requested';
    }
    return 'Pending';
  }

  get interviewStatusColor(): string {
    if (this.interviewCompleted) {
      return 'success';
    }
    if (this.vm?.caseData?.exitInterviewRequested === false) {
      return 'default';
    }
    return 'processing';
  }

  get createDateError(): string {
    const formErrors = this.createCaseForm.errors || {};
    if (formErrors['noticeOrder']) {
      return 'Notice start date must be on/before notice end date.';
    }
    if (formErrors['lastWorkingBeforeNoticeEnd']) {
      return 'Last working date must be on/after notice end date.';
    }
    if (formErrors['noticeAfterLastWorking']) {
      return 'Notice dates cannot be after last working date.';
    }
    return '';
  }

  ngOnInit(): void {
    this.userContext.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      const parsed = Number(user?.employeeId);
      this.currentUserEmployeeId = Number.isFinite(parsed) ? parsed : 0;
      this.cdr.markForCheck();
    });

    this.userContext.isHR$.pipe(takeUntil(this.destroy$)).subscribe((isHR) => {
      this.isHR = isHR;
      this.cdr.markForCheck();
    });

    this.facade.employeesForSelect$.pipe(takeUntil(this.destroy$)).subscribe((rows) => {
      this.employees = rows || [];
      this.cdr.markForCheck();
    });

    this.assetActionForm.controls.returnedState.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const current = this.assetActionForm.controls.conditionOnReturn.value;
      if (!this.availableConditionOptions.includes(current)) {
        this.assetActionForm.controls.conditionOnReturn.setValue(this.availableConditionOptions[0] || 'N/A');
      }
      this.assetActionForm.controls.conditionOnReturn.updateValueAndValidity();
    });

    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.offboardingId = params.get('offboardingId') || '';
          return this.loadCaseContext(this.offboardingId);
        })
      )
      .subscribe((vm) => {
        this.vm = vm;
        if (!this.selectedDepartment || !this.departments.includes(this.selectedDepartment)) {
          this.selectedDepartment = this.departments[0] || '';
        }
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToRequests(): void {
    this.router.navigate(['/app/offboarding-v2']);
  }

  openCreateCaseModal(): void {
    this.createCaseForm.reset({
      employeeId: '',
      initiator: 'HR',
      exitType: 'RESIGNATION',
      reason: '',
      comments: null,
      exitInterviewRequested: true,
      noticeStart: null,
      noticeEnd: null,
      lastWorkingDate: ''
    });
    this.createCaseVisible = true;
  }

  closeCreateCaseModal(): void {
    this.createCaseVisible = false;
  }

  submitCreateCase(): void {
    if (this.createCaseForm.invalid) {
      this.createCaseForm.markAllAsTouched();
      return;
    }

    this.creatingCase = true;
    const value = this.createCaseForm.getRawValue();
    const payload: CreateOffboardingPayload = {
      employeeId: value.employeeId,
      initiator: value.initiator,
      exitDate: value.lastWorkingDate,
      noticePeriodStart: value.noticeStart || undefined,
      noticePeriodEnd: value.noticeEnd || undefined,
      offboardingType: value.exitType,
      reason: value.reason,
      comments: value.comments || undefined,
      exitInterviewRequested: value.exitInterviewRequested
    };

    this.facade
      .createOffboarding(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.creatingCase = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((created) => {
        this.createCaseVisible = false;
        const targetId = String(created.id || created.offboardingId || created.caseId || '').trim();
        if (targetId) {
          this.router.navigate(['/app/offboarding-v2/case', targetId]);
          return;
        }
        this.reload();
      });
  }

  attemptComplete(): void {
    if (!this.isClosable) {
      return;
    }

    this.facade
      .attemptComplete(this.offboardingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.reload());
  }

  selectDepartment(department: string): void {
    this.selectedDepartment = department;
  }

  onTaskSearch(term: string): void {
    this.taskSearchTerm = term;
  }

  resetTaskFilters(): void {
    this.taskSearchTerm = '';
  }

  taskNameFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.searchedPendingTasksForSelectedDepartment.map((task) => String(task.taskName || '-')))]
      .map((value) => ({ text: value, value }));
  }

  taskNameFilterFn = (values: string[], item: OffboardingTask): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.taskName || '-'));
  };

  taskNameSortFn = (a: OffboardingTask, b: OffboardingTask): number =>
    String(a.taskName || '').localeCompare(String(b.taskName || ''));

  taskOwnerFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.searchedPendingTasksForSelectedDepartment.map((task) => String(task.taskOwner || '-')))]
      .map((value) => ({ text: value, value }));
  }

  taskOwnerFilterFn = (values: string[], item: OffboardingTask): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.taskOwner || '-'));
  };

  taskOwnerSortFn = (a: OffboardingTask, b: OffboardingTask): number =>
    String(a.taskOwner || '').localeCompare(String(b.taskOwner || ''));

  taskStatusFilters(): Array<{ text: string; value: string }> {
    return [
      ...new Set(
        this.searchedPendingTasksForSelectedDepartment.map((task) => String(task.completionStatus || '-'))
      )
    ].map((value) => ({ text: this.toDisplayText(value), value }));
  }

  taskStatusFilterFn = (values: string[], item: OffboardingTask): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.completionStatus || '-'));
  };

  taskStatusSortFn = (a: OffboardingTask, b: OffboardingTask): number =>
    String(a.completionStatus || '').localeCompare(String(b.completionStatus || ''));

  onMainTabChange(index: number | Event): void {
    if (typeof index === 'number') {
      this.selectedMainTab = index;
    }
  }

  canCompleteTask(task: OffboardingTask): boolean {
    return task.completionStatus !== 'COMPLETED';
  }

  isConditionDisabled(condition: string): boolean {
    return !this.availableConditionOptions.includes(condition);
  }

  openTaskDrawer(task: OffboardingTask): void {
    this.selectedTask = task;
    this.taskEvidenceFiles = [];
    this.taskCompleteForm.reset({
      systemName: '',
      evidenceFilePath: '',
      comment: null
    });
    this.taskDrawerVisible = true;
  }

  closeTaskDrawer(): void {
    this.taskDrawerVisible = false;
    this.selectedTask = null;
    this.taskEvidenceFiles = [];
  }

  handleTaskEvidenceChange(event: { fileList: NzUploadFile[] }): void {
    this.taskEvidenceFiles = event.fileList || [];
    const latest = this.taskEvidenceFiles[this.taskEvidenceFiles.length - 1];
    this.taskCompleteForm.controls.evidenceFilePath.setValue(latest?.name || '');
  }

  submitTaskCompletion(): void {
    if (!this.selectedTask || this.taskCompleteForm.invalid) {
      this.taskCompleteForm.markAllAsTouched();
      return;
    }

    this.taskSaving = true;
    const formValue = this.taskCompleteForm.getRawValue();
    const payload: TaskCompletionPayload = {
      completed: true,
      completionDate: new Date().toISOString(),
      evidenceFilePath: formValue.evidenceFilePath,
      systemName: formValue.systemName,
      comment: formValue.comment || undefined,
      taskOwnerId: this.currentUserEmployeeId || this.selectedTask.taskOwnerId,
      accessRevoked: true
    };

    this.facade
      .completeTask(this.selectedTask.taskId, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.taskSaving = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(() => {
        this.taskDrawerVisible = false;
        this.reload();
      });
  }

  isAssetReturned(asset: OffboardingAsset): boolean {
    const withReturned = asset as OffboardingAsset & { returned?: boolean | null };
    if (typeof withReturned.returned === 'boolean') {
      return withReturned.returned;
    }
    return asset.returnStatus !== 'NOT_RETURNED';
  }

  canAcknowledgeAsset(asset: OffboardingAsset): boolean {
    return this.isAssetReturned(asset) && asset.employeeConfirmed == null;
  }

  openAssetReturnDrawer(asset: OffboardingAsset): void {
    this.selectedAsset = asset;
    this.assetReturnDrawerVisible = true;
  }

  openAssetAcknowledgeDrawer(asset: OffboardingAsset): void {
    this.selectedAsset = asset;
    this.assetAcknowledgeDrawerVisible = true;
  }

  closeAssetDrawers(): void {
    this.assetReturnDrawerVisible = false;
    this.assetAcknowledgeDrawerVisible = false;
    this.selectedAsset = null;
  }

  submitAssetReturnAction(payload: AssetReturnPayload): void {
    if (!this.selectedAsset) {
      return;
    }

    this.assetSaving = true;
    this.facade
      .returnAsset(this.selectedAsset.assetNoteId, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.assetSaving = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(() => {
        this.message.success(payload.returned ? 'Asset returned.' : 'Asset marked as not returned.');
        this.closeAssetDrawers();
        this.reload();
      });
  }

  submitAssetAcknowledgeAction(payload: AssetAcknowledgePayload): void {
    if (!this.selectedAsset || !this.isAssetReturned(this.selectedAsset)) {
      this.message.warning('Asset must be returned before acknowledgement.');
      return;
    }

    this.assetSaving = true;
    this.facade
      .acknowledgeAsset(this.selectedAsset.assetNoteId, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.assetSaving = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(() => {
        this.message.success('Asset acknowledgement captured.');
        this.closeAssetDrawers();
        this.reload();
      });
  }

  openAssetDrawer(asset: OffboardingAsset): void {
    this.selectedAsset = asset;
    this.assetEvidenceFiles = [];
    const returnedState = asset.returnStatus === 'NOT_RETURNED' ? 'NOT_RETURNED' : 'RETURNED';
    const fallbackCondition = returnedState === 'NOT_RETURNED' ? 'N/A' : 'Good';
    const resolvedCondition = this.isConditionValidForState(
      asset.conditionOnReturn || fallbackCondition,
      returnedState
    )
      ? (asset.conditionOnReturn || fallbackCondition)
      : fallbackCondition;

    this.assetActionForm.reset({
      returnedState,
      conditionOnReturn: resolvedCondition,
      evidenceFilePath: '',
      remarks: asset.remarks || null
    });
    this.assetDrawerVisible = true;
  }

  closeAssetDrawer(): void {
    this.assetDrawerVisible = false;
    this.selectedAsset = null;
    this.assetEvidenceFiles = [];
  }

  handleAssetEvidenceChange(event: { fileList: NzUploadFile[] }): void {
    this.assetEvidenceFiles = event.fileList || [];
    const latest = this.assetEvidenceFiles[this.assetEvidenceFiles.length - 1];
    this.assetActionForm.controls.evidenceFilePath.setValue(latest?.name || '');
  }

  submitAssetAction(): void {
    if (!this.selectedAsset || this.assetActionForm.invalid) {
      this.assetActionForm.markAllAsTouched();
      return;
    }

    const value = this.assetActionForm.getRawValue();
    const isReturned = value.returnedState === 'RETURNED';
    if (!this.isConditionValidForState(value.conditionOnReturn, value.returnedState)) {
      this.assetActionForm.controls.conditionOnReturn.setErrors({ invalidForNotReturned: true });
      this.message.warning('The selected condition is not valid for the selected return state.');
      return;
    }

    const payload: AssetReturnPayload = {
      returned: isReturned,
      returnDate: new Date().toISOString().slice(0, 10),
      conditionOnReturn: value.conditionOnReturn,
      remarks: value.remarks || undefined,
      offboardingId: Number(this.vm?.caseData.offboardingRecordId || this.offboardingId || 0)
    };

    this.assetSaving = true;
    this.facade
      .returnAsset(this.selectedAsset.assetNoteId, payload)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((updated) => {
          if (isReturned) {
            const ackPayload: AssetAcknowledgePayload = {
              employeeConfirmed: true,
              evidenceFilePath: value.evidenceFilePath || undefined
            };
            return this.facade.acknowledgeAsset(updated.assetNoteId, ackPayload);
          }
          return of(updated);
        }),
        finalize(() => {
          this.assetSaving = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(() => {
        if (isReturned) {
          this.message.success('Asset returned and acknowledged.');
        } else {
          this.message.success('Asset marked as not returned.');
        }
        this.assetDrawerVisible = false;
        this.reload();
      });
  }

  submitExitInterview(payload: ExitInterviewSubmitPayload): void {
    if (!this.offboardingId || this.interviewCompleted) {
      return;
    }

    this.interviewSaving = true;
    this.facade
      .submitExitInterview(this.offboardingId, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.interviewSaving = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(() => {
        this.message.success('Offboarding interview completed.');
        this.reload();
      });
  }

  customUploadRequest = (item: NzUploadXHRArgs): Subscription => {
    const timer = setTimeout(() => {
      item.onSuccess?.({ ok: true }, item.file, null);
    }, 200);

    return new Subscription(() => clearTimeout(timer));
  };

  private reload(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.loadCaseContext(this.offboardingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((vm) => {
        this.vm = vm;
        if (!this.selectedDepartment || !this.departments.includes(this.selectedDepartment)) {
          this.selectedDepartment = this.departments[0] || '';
        }
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  private loadCaseContext(offboardingId: string) {
    const case$ = this.facade.getCase(offboardingId).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    const tasks$ = this.facade.getTasks(offboardingId).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    const interview$ = this.facade
      .getExitInterview(offboardingId)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
    const workflow$ = this.facade
      .getWorkflowStatus(offboardingId)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
    const events$ = this.facade.getEvents(offboardingId).pipe(shareReplay({ bufferSize: 1, refCount: true }));

    const assets$ = case$.pipe(
      switchMap((caseData) => this.facade.getPendingAssets(caseData.employeeId)),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    return case$.pipe(
      switchMap((caseData) =>
        this.facade.canViewEmployee(caseData.employeeId).pipe(
          take(1),
          switchMap((allowed) => {
            if (!allowed) {
              this.router.navigate(['/app/offboarding-v2']);
              return EMPTY;
            }
            return combineLatest([of(caseData), tasks$, assets$, interview$, workflow$, events$]).pipe(
              map(([safeCaseData, tasks, assets, exitInterview, workflow, events]) => ({
                caseData: safeCaseData,
                tasks,
                assets,
                exitInterview,
                workflow,
                events
              }))
            );
          })
        )
      )
    );
  }

  private mapEventsToTimeline(events: OffboardingEvent[]): TimelineItemVm[] {
    return [...events]
      .sort((a, b) => {
        const left = new Date(a.timestamp || a.occurredAt || 0).getTime();
        const right = new Date(b.timestamp || b.occurredAt || 0).getTime();
        return right - left;
      })
      .map((event) => ({
        title: event.action || event.eventType || event.entity,
        actor:
          `${event.performedBy?.firstName || ''} ${event.performedBy?.lastName || ''}`.trim() ||
          event.actor ||
          'System',
        timestamp: event.timestamp || event.occurredAt || '',
        status: event.eventType || event.action,
        comment: event.notes || event.description || undefined
      }));
  }

  private toDisplayText(value: string): string {
    const normalized = String(value || '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    if (!normalized) {
      return '';
    }
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  private isConditionValidForState(
    condition: string,
    returnedState: 'RETURNED' | 'NOT_RETURNED'
  ): boolean {
    const allowed =
      returnedState === 'RETURNED' ? this.returnedConditionOptions : this.notReturnedConditionOptions;
    return allowed.includes(condition);
  }

  timelineItemColor(item: TimelineItemVm): string {
    const signal = `${item.status || ''} ${item.title || ''}`.toUpperCase();

    if (
      signal.includes('COMPLETED') ||
      signal.includes('CLOSED') ||
      signal.includes('DONE') ||
      signal.includes('SUCCESS') ||
      signal.includes('APPROVED')
    ) {
      return 'green';
    }

    if (
      signal.includes('BLOCKED') ||
      signal.includes('FAILED') ||
      signal.includes('ERROR') ||
      signal.includes('REJECTED') ||
      signal.includes('OVERDUE')
    ) {
      return 'red';
    }

    if (
      signal.includes('IN_PROGRESS') ||
      signal.includes('IN PROGRESS') ||
      signal.includes('PROCESSING')
    ) {
      return 'blue';
    }

    if (
      signal.includes('PENDING') ||
      signal.includes('OPEN') ||
      signal.includes('TODO') ||
      signal.includes('CREATED') ||
      signal.includes('INITIATED')
    ) {
      return 'orange';
    }

    return 'gray';
  }

  private dateRulesValidator = (control: AbstractControl): ValidationErrors | null => {
    const form = control as FormGroup<CreateCaseFormModel>;
    const start = form?.controls?.noticeStart?.value;
    const end = form?.controls?.noticeEnd?.value;
    const lastWorkingDate = form?.controls?.lastWorkingDate?.value;

    const startTime = start ? new Date(start).getTime() : null;
    const endTime = end ? new Date(end).getTime() : null;
    const lastTime = lastWorkingDate ? new Date(lastWorkingDate).getTime() : null;

    if (startTime !== null && endTime !== null && startTime > endTime) {
      return { noticeOrder: true };
    }
    if (endTime !== null && lastTime !== null && lastTime < endTime) {
      return { lastWorkingBeforeNoticeEnd: true };
    }
    if (
      lastTime !== null &&
      ((startTime !== null && startTime > lastTime) || (endTime !== null && endTime > lastTime))
    ) {
      return { noticeAfterLastWorking: true };
    }
    return null;
  };
}
