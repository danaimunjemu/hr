import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { finalize } from 'rxjs';
import { Review360Setup } from '../../models/review-360-setup.model';
import { Review360SetupService } from '../../services/review-360-setup.service';
import { EmployeeService } from '../../services/employee.service';
import { PerformanceCycleService } from '../../services/performance-cycle.service';
import { Employee } from '../../models/employee.model';
import { PerformanceCycle } from '../../models/performance-cycle.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-review-360-setup',
  standalone: false,
  templateUrl: './review-360-setup.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class Review360SetupComponent implements OnInit {
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(true);
  setups: WritableSignal<Review360Setup[]> = signal([]);
  employees: WritableSignal<Employee[]> = signal([]);
  cycles: WritableSignal<PerformanceCycle[]> = signal([]);
  loadingEmployees: WritableSignal<boolean> = signal(false);
  loadingCycles: WritableSignal<boolean> = signal(false);
  submitting: WritableSignal<boolean> = signal(false);
  isAddModalVisible: WritableSignal<boolean> = signal(false);

  constructor(
    private fb: FormBuilder,
    private review360SetupService: Review360SetupService,
    private employeeService: EmployeeService,
    private performanceCycleService: PerformanceCycleService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      employeeId: [null, [Validators.required]],
      cycleId: [null, [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      anonymous: [false],
      reviewerIds: [[], [Validators.required]]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    this.loadData();
    this.loadEmployees();
    this.loadCycles();
  }

  loadData(): void {
    this.loading.set(true);
    this.review360SetupService.getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.setups.set(data),
        error: (err: any) => console.error('Failed to load 360 setups', err)
      });
  }

  loadEmployees(): void {
    this.loadingEmployees.set(true);
    this.employeeService.getAll()
      .pipe(finalize(() => this.loadingEmployees.set(false)))
      .subscribe({
        next: (data) => this.employees.set(data),
        error: () => this.message.error('Failed to load employees')
      });
  }

  loadCycles(): void {
    this.loadingCycles.set(true);
    this.performanceCycleService.getAll()
      .pipe(finalize(() => this.loadingCycles.set(false)))
      .subscribe({
        next: (data) => this.cycles.set(data),
        error: () => this.message.error('Failed to load cycles')
      });
  }

  getEmployeeName(setup: Review360Setup): string {
    if (setup.employee?.firstName && setup.employee?.lastName) {
      return `${setup.employee.firstName} ${setup.employee.lastName}`;
    }
    return setup.employee?.employeeNumber || '-';
  }

  getEmployeeLabel(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName} (${employee.employeeNumber})`;
  }

  getReviewerCount(setup: Review360Setup): number {
    return setup.reviewers?.length || 0;
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'DRAFT': 'default',
      'ACTIVE': 'blue',
      'IN_PROGRESS': 'blue',
      'COMPLETED': 'green',
      'CLOSED': 'green'
    };
    return statusColors[status] || 'default';
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return { dateRange: true };
    }
    return null;
  }

  openAddModal(): void {
    this.form.reset({
      employeeId: null,
      cycleId: null,
      startDate: null,
      endDate: null,
      anonymous: false,
      reviewerIds: []
    });
    this.isAddModalVisible.set(true);
  }

  closeAddModal(): void {
    this.isAddModalVisible.set(false);
  }

  submitAdd(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    if (this.form.errors?.['dateRange']) {
      this.message.error('End date must be greater than or equal to start date');
      return;
    }

    const formValue = this.form.value;
    const payload = {
      employeeId: formValue.employeeId,
      cycleId: formValue.cycleId,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      anonymous: formValue.anonymous,
      reviewerIds: formValue.reviewerIds
    };

    this.submitting.set(true);
    this.review360SetupService.createWithReviewers(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.message.success('360 setup created successfully');
          this.closeAddModal();
          this.loadData();
        },
        error: () => this.message.error('Failed to create 360 setup')
      });
  }
}
