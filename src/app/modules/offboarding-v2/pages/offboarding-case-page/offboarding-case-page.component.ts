import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EMPTY,
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
import { OffboardingCase } from '../../models/offboarding-case.model';
import { OffboardingTask, TaskCompletionPayload } from '../../models/offboarding-task.model';
import {
  AssetAcknowledgePayload,
  AssetReturnPayload,
  OffboardingAsset
} from '../../models/offboarding-asset.model';
import { ExitInterviewResponse, ExitInterviewSubmitPayload } from '../../models/exit-interview.model';
import { WorkflowStatus } from '../../models/workflow-status.model';
import { OffboardingEvent } from '../../models/offboarding-event.model';
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

@Component({
  selector: 'app-offboarding-case-page',
  standalone: false,
  templateUrl: './offboarding-case-page.component.html',
  styleUrl: './offboarding-case-page.component.scss'
})
export class OffboardingCasePageComponent implements OnInit, OnDestroy {
  loading = true;
  savingTaskId: string | null = null;
  savingAssetId: string | null = null;
  savingInterview = false;
  completing = false;

  offboardingId = '';
  vm: CaseVm | null = null;
  isHR = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly facade: OffboardingV2FacadeService,
    private readonly userContext: UserContextService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  get tabKeys(): string[] {
    return ['overview', 'tasks', 'assets', 'interview', 'audit', ...(this.isHR ? ['analytics'] : [])];
  }

  get isCompleted(): boolean {
    const status = this.vm?.caseData?.offboardingStatus || this.vm?.caseData?.status;
    return status === 'COMPLETED';
  }

  ngOnInit(): void {
    this.userContext.isHR$.pipe(takeUntil(this.destroy$)).subscribe((isHR) => {
      this.isHR = isHR;
      this.cdr.detectChanges();
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
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToInitiate(): void {
    this.router.navigate(['/app/offboarding-v2/initiate']);
  }

  goToRequests(): void {
    this.router.navigate(['/app/offboarding-v2']);
  }

  onTabChange(index: number): void {
    const key = this.tabKeys[index];
    if (key === 'analytics') {
      this.router.navigate(['/app/offboarding-v2/case', this.offboardingId, 'analytics']);
      return;
    }
  }

  completeTask(event: { taskId: string; payload: TaskCompletionPayload }): void {
    this.savingTaskId = event.taskId;
    this.facade
      .completeTask(event.taskId, event.payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.savingTaskId = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe(() => this.reload());
  }

  returnAsset(event: { assetId: string; payload: AssetReturnPayload }): void {
    this.savingAssetId = event.assetId;
    this.facade
      .returnAsset(event.assetId, event.payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.savingAssetId = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe(() => this.reload());
  }

  acknowledgeAsset(event: { assetId: string; payload: AssetAcknowledgePayload }): void {
    this.savingAssetId = event.assetId;
    this.facade
      .acknowledgeAsset(event.assetId, event.payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.savingAssetId = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe(() => this.reload());
  }

  submitInterview(payload: ExitInterviewSubmitPayload): void {
    this.savingInterview = true;
    this.facade
      .submitExitInterview(this.offboardingId, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.savingInterview = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(() => this.reload());
  }

  attemptComplete(): void {
    if (this.isCompleted) {
      return;
    }

    this.completing = true;
    this.facade
      .attemptComplete(this.offboardingId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.completing = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(() => this.reload());
  }

  private reload(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.loadCaseContext(this.offboardingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((vm) => {
        this.vm = vm;
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  private loadCaseContext(offboardingId: string) {
    const case$ = this.facade.getCase(offboardingId).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    const tasks$ = this.facade.getTasks(offboardingId).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    const exit$ = this.facade.getExitInterview(offboardingId).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    const workflow$ = this.facade.getWorkflowStatus(offboardingId).pipe(shareReplay({ bufferSize: 1, refCount: true }));
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
            return combineLatest([of(caseData), tasks$, assets$, exit$, workflow$, events$]).pipe(
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
}
