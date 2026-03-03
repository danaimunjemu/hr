import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, combineLatest, finalize, map, startWith, takeUntil } from 'rxjs';
import {
  CreateOffboardingPayload,
  InitiatorType,
  OffboardingCaseSummary,
  OffboardingStatus,
  OffboardingType
} from '../../models/offboarding-case.model';
import { EmployeeSummary } from '../../models/employee-summary.model';
import { OffboardingV2FacadeService } from '../../services/offboarding-v2-facade.service';
import { UserContextService } from '../../services/user-context.service';

interface FilterForm {
  status: FormControl<OffboardingStatus | 'ALL'>;
  offboardingType: FormControl<OffboardingType | 'ALL'>;
}

interface CreateRequestFormModel {
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
  selector: 'app-requests-list-page',
  standalone: false,
  templateUrl: './requests-list-page.component.html',
  styleUrl: './requests-list-page.component.scss'
})
export class RequestsListPageComponent implements OnInit, OnDestroy {
  readonly form: FormGroup<FilterForm>;
  readonly createRequestForm: FormGroup<CreateRequestFormModel>;
  readonly destroy$ = new Subject<void>();

  loading = true;
  createRequestVisible = false;
  creatingRequest = false;
  isHR = false;
  searchTerm = '';
  employees: EmployeeSummary[] = [];

  statuses: Array<OffboardingStatus | 'ALL'> = [
    'ALL',
    'INITIATED',
    'IN_PROGRESS',
    'BLOCKED',
    'READY_FOR_COMPLETION',
    'COMPLETED'
  ];

  exitTypes: Array<OffboardingType | 'ALL'> = [
    'ALL',
    'RESIGNATION',
    'RETIREMENT',
    'DISMISSAL',
    'CONTRACT_EXPIRY',
    'RETRENCHMENT',
    'DEATH',
    'MUTUAL_SEPARATION'
  ];
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

  rows: OffboardingCaseSummary[] = [];

  get filteredRows(): OffboardingCaseSummary[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) {
      return this.rows;
    }

    return this.rows.filter((row) => {
      const haystack = [
        row.caseId,
        row.employeeNumber,
        row.employeeName,
        row.department,
        row.offboardingType,
        row.status,
        row.lastWorkingDate,
        row.createdAt
      ]
        .map((value) => String(value || '').toLowerCase())
        .join(' ');
      return haystack.includes(query);
    });
  }

  get initiatedCount(): number {
    return this.rows.filter((item) => item.status === 'INITIATED').length;
  }

  get inProgressCount(): number {
    return this.rows.filter((item) => item.status === 'IN_PROGRESS').length;
  }

  get completedCount(): number {
    return this.rows.filter((item) => item.status === 'COMPLETED').length;
  }

  get completionRate(): number {
    if (!this.rows.length) {
      return 0;
    }
    return Math.round((this.completedCount / this.rows.length) * 100);
  }

  get createDateError(): string {
    const formErrors = this.createRequestForm.errors || {};
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

  constructor(
    fb: FormBuilder,
    private readonly facade: OffboardingV2FacadeService,
    private readonly userContext: UserContextService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = fb.group<FilterForm>({
      status: fb.nonNullable.control('ALL'),
      offboardingType: fb.nonNullable.control('ALL')
    });
    this.createRequestForm = fb.group<CreateRequestFormModel>(
      {
        employeeId: fb.nonNullable.control('', [Validators.required]),
        initiator: fb.nonNullable.control('HR', [Validators.required]),
        exitType: fb.nonNullable.control('RESIGNATION', [Validators.required]),
        reason: fb.nonNullable.control('', [Validators.required, Validators.maxLength(400)]),
        comments: fb.control<string | null>(null),
        exitInterviewRequested: fb.nonNullable.control(true),
        noticeStart: fb.control<string | null>(null),
        noticeEnd: fb.control<string | null>(null),
        lastWorkingDate: fb.nonNullable.control('', [Validators.required])
      },
      { validators: this.dateRulesValidator }
    );
  }

  ngOnInit(): void {
    this.userContext.isHR$.pipe(takeUntil(this.destroy$)).subscribe((isHR) => {
      this.isHR = isHR;
      this.cdr.detectChanges();
    });
    this.facade.employeesForSelect$.pipe(takeUntil(this.destroy$)).subscribe((rows) => {
      this.employees = rows || [];
      this.cdr.detectChanges();
    });

    combineLatest([
      this.facade.requests$,
      this.form.valueChanges.pipe(startWith(this.form.getRawValue()))
    ])
      .pipe(
        takeUntil(this.destroy$),
        map(([rows, filters]) =>
          rows.filter((row) => {
            const statusMatch = filters.status === 'ALL' || row.status === filters.status;
            const typeMatch =
              filters.offboardingType === 'ALL' || row.offboardingType === filters.offboardingType;
            return statusMatch && typeMatch;
          })
        )
      )
      .subscribe((rows) => {
        this.rows = rows;
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  view(row: OffboardingCaseSummary): void {
    this.router.navigate(['/app/offboarding-v2/case', row.id]);
  }

  create(): void {
    this.openCreateRequestModal();
  }

  openAnalytics(): void {
    this.router.navigate(['/app/offboarding-v2/analytics']);
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  resetFilters(): void {
    this.searchTerm = '';
  }

  openCreateRequestModal(): void {
    this.createRequestForm.reset({
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
    this.createRequestVisible = true;
  }

  closeCreateRequestModal(): void {
    this.createRequestVisible = false;
  }

  submitCreateRequest(): void {
    if (this.createRequestForm.invalid) {
      this.createRequestForm.markAllAsTouched();
      return;
    }

    this.creatingRequest = true;
    const value = this.createRequestForm.getRawValue();
    const payload: CreateOffboardingPayload = {
      employeeId: value.employeeId,
      initiator: value.initiator,
      exitDate: value.lastWorkingDate,
      noticePeriodStartDate: value.noticeStart || undefined,
      noticePeriodEndDate: value.noticeEnd || undefined,
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
          this.creatingRequest = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((created) => {
        this.createRequestVisible = false;
        const targetId = String(created.id || '').trim();
        if (targetId) {
          this.router.navigate(['/app/offboarding-v2/case', targetId]);
        }
      });
  }

  get statusColumnFilters(): Array<{ text: string; value: string }> {
    return this.statuses
      .filter((status) => status !== 'ALL')
      .map((status) => ({ text: this.toDisplayText(status), value: status }));
  }

  get exitTypeColumnFilters(): Array<{ text: string; value: string }> {
    return this.exitTypes
      .filter((type) => type !== 'ALL')
      .map((type) => ({ text: this.toDisplayText(type), value: type }));
  }

  get departmentColumnFilters(): Array<{ text: string; value: string }> {
    const departments = Array.from(
      new Set(this.rows.map((item) => item.department).filter((value) => Boolean(value)))
    ).sort((a, b) => a.localeCompare(b));
    return departments.map((department) => ({ text: department, value: department }));
  }

  statusColumnFilterFn(selectedValues: ReadonlyArray<string>, item: OffboardingCaseSummary): boolean {
    if (!selectedValues || selectedValues.length === 0) {
      return true;
    }
    return selectedValues.includes(item.status);
  }

  exitTypeColumnFilterFn(selectedValues: ReadonlyArray<string>, item: OffboardingCaseSummary): boolean {
    if (!selectedValues || selectedValues.length === 0) {
      return true;
    }
    return selectedValues.includes(item.offboardingType);
  }

  departmentColumnFilterFn(selectedValues: ReadonlyArray<string>, item: OffboardingCaseSummary): boolean {
    if (!selectedValues || selectedValues.length === 0) {
      return true;
    }
    return selectedValues.includes(item.department);
  }

  caseIdSortFn = (a: OffboardingCaseSummary, b: OffboardingCaseSummary): number =>
    String(a.caseId || '').localeCompare(String(b.caseId || ''));

  employeeSortFn = (a: OffboardingCaseSummary, b: OffboardingCaseSummary): number =>
    `${a.employeeNumber || ''} ${a.employeeName || ''}`
      .toLowerCase()
      .localeCompare(`${b.employeeNumber || ''} ${b.employeeName || ''}`.toLowerCase());

  departmentSortFn = (a: OffboardingCaseSummary, b: OffboardingCaseSummary): number =>
    String(a.department || '').localeCompare(String(b.department || ''));

  exitTypeSortFn = (a: OffboardingCaseSummary, b: OffboardingCaseSummary): number =>
    String(a.offboardingType || '').localeCompare(String(b.offboardingType || ''));

  lastWorkingDateSortFn = (a: OffboardingCaseSummary, b: OffboardingCaseSummary): number =>
    new Date(a.lastWorkingDate || 0).getTime() - new Date(b.lastWorkingDate || 0).getTime();

  statusSortFn = (a: OffboardingCaseSummary, b: OffboardingCaseSummary): number =>
    String(a.status || '').localeCompare(String(b.status || ''));

  createdOnSortFn = (a: OffboardingCaseSummary, b: OffboardingCaseSummary): number =>
    new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();

  statusColor(status: OffboardingStatus): string {
    if (status === 'COMPLETED') {
      return 'success';
    }
    if (status === 'BLOCKED') {
      return 'error';
    }
    if (status === 'READY_FOR_COMPLETION') {
      return 'processing';
    }
    if (status === 'IN_PROGRESS') {
      return 'warning';
    }
    return 'default';
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

  private dateRulesValidator = (control: AbstractControl): ValidationErrors | null => {
    const form = control as FormGroup<CreateRequestFormModel>;
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
