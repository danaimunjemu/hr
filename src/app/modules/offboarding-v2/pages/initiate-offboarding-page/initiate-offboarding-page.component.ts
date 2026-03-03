import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, combineLatest, finalize, map, startWith, takeUntil } from 'rxjs';
import {
  CreateOffboardingPayload,
  EmployeeSnapshot,
  InitiatorType,
  OffboardingType
} from '../../models/offboarding-case.model';
import { EmployeeSummary } from '../../models/employee-summary.model';
import { OffboardingV2FacadeService } from '../../services/offboarding-v2-facade.service';
import { UserContextService } from '../../services/user-context.service';

interface InitiationForm {
  employeeId: FormControl<string>;
  initiator: FormControl<InitiatorType>;
  lastWorkingDate: FormControl<string>;
  noticePeriodStart: FormControl<string | null>;
  noticePeriodEnd: FormControl<string | null>;
  exitType: FormControl<OffboardingType>;
  reason: FormControl<string>;
  comments: FormControl<string | null>;
  exitInterviewRequested: FormControl<boolean>;
}

@Component({
  selector: 'app-initiate-offboarding-page',
  standalone: false,
  templateUrl: './initiate-offboarding-page.component.html',
  styleUrl: './initiate-offboarding-page.component.scss'
})
export class InitiateOffboardingPageComponent implements OnInit, OnDestroy {
  readonly initiatorOptions: Array<{ label: string; value: InitiatorType }> = [
    { label: 'HR', value: 'HR' },
    { label: 'Line Manager', value: 'LINE_MANAGER' },
    { label: 'System Triggered (fixed-term end)', value: 'SYSTEM_TRIGGERED' },
    { label: 'Employee (self-service)', value: 'EMPLOYEE_SELF_SERVICE' }
  ];

  readonly exitTypes: Array<{ label: string; value: OffboardingType }> = [
    { label: 'Resignation', value: 'RESIGNATION' },
    { label: 'Retirement', value: 'RETIREMENT' },
    { label: 'Dismissal', value: 'DISMISSAL' },
    { label: 'Contract Expiry', value: 'CONTRACT_EXPIRY' },
    { label: 'Retrenchment', value: 'RETRENCHMENT' },
    { label: 'Death', value: 'DEATH' },
    { label: 'Mutual Separation', value: 'MUTUAL_SEPARATION' }
  ];

  readonly form: FormGroup<InitiationForm>;

  employees: EmployeeSummary[] = [];
  employee: EmployeeSnapshot | null = null;
  loadingEmployee = false;
  submitting = false;

  isHR = false;
  hasSubordinates = false;
  currentEmployeeId = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    fb: FormBuilder,
    private readonly facade: OffboardingV2FacadeService,
    private readonly userContext: UserContextService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = fb.group<InitiationForm>({
      employeeId: fb.nonNullable.control('', [Validators.required]),
      initiator: fb.nonNullable.control('HR', [Validators.required]),
      lastWorkingDate: fb.nonNullable.control('', [Validators.required]),
      noticePeriodStart: fb.control<string | null>(null),
      noticePeriodEnd: fb.control<string | null>(null),
      exitType: fb.nonNullable.control('RESIGNATION', [Validators.required]),
      reason: fb.nonNullable.control('', [Validators.required, Validators.maxLength(400)]),
      comments: fb.control<string | null>(null),
      exitInterviewRequested: fb.nonNullable.control(true)
    });
  }

  ngOnInit(): void {
    combineLatest([
      this.userContext.currentUser$,
      this.userContext.isHR$,
      this.userContext.hasSubordinates$,
      this.facade.employeesForSelect$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([user, isHR, hasSubordinates, employees]) => {
        this.currentEmployeeId = user.employeeId;
        this.isHR = isHR;
        this.hasSubordinates = hasSubordinates;
        this.employees = employees;
        this.cdr.detectChanges();

        // if (!isHR && !hasSubordinates) {
        //   this.form.controls.employeeId.setValue(user.employeeId);
        //   this.form.controls.employeeId.disable({ emitEvent: false });
        // } else if (this.form.controls.employeeId.disabled) {
        //   this.form.controls.employeeId.enable({ emitEvent: false });
        // }

        // if (!this.form.controls.employeeId.value && employees.length > 0) {
        //   const first = employees.find((item) => item.employeeId === user.employeeId) || employees[0];
        //   this.form.controls.employeeId.setValue(first.employeeId);
        // }
      });

    this.form.controls.employeeId.valueChanges
      .pipe(
        startWith(this.form.controls.employeeId.value),
        takeUntil(this.destroy$)
      )
      .subscribe((employeeId) => {
        if (employeeId) {
          this.loadEmployee(employeeId);
        } else {
          this.employee = null;
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  optionLabel(item: EmployeeSummary): string {
    return `${item.employeeNumber}  ${item.fullName}  ${item.department}`;
  }

  loadEmployee(employeeId: string): void {
    this.loadingEmployee = true;

    const fromSelect = this.employees.find((item) => item.employeeId === employeeId);
    if (fromSelect) {
      this.employee = {
        employeeId: fromSelect.employeeId,
        fullName: fromSelect.fullName,
        department: fromSelect.department,
        jobTitle: fromSelect.jobTitle,
        manager: fromSelect.managerName || '-',
        employeeType: fromSelect.employeeType,
        startDate: fromSelect.startDate,
        yearsOfService: fromSelect.yearsOfService
      };
      this.loadingEmployee = false;
      this.cdr.detectChanges();
      return;
    }

    this.facade
      .getEmployee(employeeId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingEmployee = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (employee) => {
          this.employee = employee;
          this.cdr.detectChanges();
        },
        error: () => {
          this.employee = null;
          this.cdr.detectChanges();
        }
      });
  }

  submit(): void {
    if (this.form.invalid || !this.employee) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const value = this.form.getRawValue();

    const payload: CreateOffboardingPayload = {
      employeeId: value.employeeId,
      initiator: value.initiator,
      exitDate: value.lastWorkingDate,
      noticePeriodStartDate: value.noticePeriodStart || undefined,
      noticePeriodEndDate: value.noticePeriodEnd || undefined,
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
          this.submitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((created) => {
        const createdWithId = created as typeof created & { id?: string | number };
        const targetId = String(
          createdWithId.id || created.offboardingId || created.caseId || ''
        ).trim();
        if (targetId) {
          this.router.navigate(['/app/offboarding-v2/case', targetId]);
          return;
        }
        this.router.navigate(['/app/offboarding-v2']);
        this.cdr.detectChanges();
      });
  }
}
