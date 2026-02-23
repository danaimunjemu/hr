import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { Employee, EmployeesService } from '../../../employees/services/employees.service';
import { OffboardingRecord, OffboardingType, OffboardingUpsertRequest } from '../../models/offboarding.model';

@Component({
  selector: 'app-offboarding-form',
  standalone: false,
  templateUrl: './offboarding-form.component.html',
  styleUrl: './offboarding-form.component.scss'
})
export class OffboardingFormComponent implements OnInit, OnChanges {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() saving = false;
  @Input() initialValue: OffboardingRecord | null = null;
  @Output() submitted = new EventEmitter<OffboardingUpsertRequest>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  loadingEmployees = false;
  employeeOptions: Employee[] = [];
  offboardingTypes: OffboardingType[] = [
    'RESIGNATION',
    'TERMINATION',
    'RETIREMENT',
    'END_OF_CONTRACT'
  ];

  constructor(
    private fb: FormBuilder,
    private employeesService: EmployeesService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      employeeId: [null, Validators.required],
      offboardingType: ['RESIGNATION', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]],
      lastWorkingDay: [null, Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.patchFromRecord(this.initialValue);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue']) {
      this.patchFromRecord(this.initialValue);
    }
  }

  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const request: OffboardingUpsertRequest = {
      employeeId: Number(value.employeeId),
      offboardingType: value.offboardingType as OffboardingType,
      reason: String(value.reason ?? '').trim(),
      lastWorkingDay: this.toIsoDate(value.lastWorkingDay),
      notes: String(value.notes ?? '').trim() || undefined
    };

    this.submitted.emit(request);
  }

  cancel(): void {
    this.cancelled.emit();
  }

  private loadEmployees(): void {
    this.loadingEmployees = true;
    this.employeesService
      .getAll()
      .pipe(finalize(() => (this.loadingEmployees = false)))
      .subscribe({
        next: employees => {
          this.employeeOptions = employees;
        },
        error: (error: Error) => {
          this.message.error(error.message || 'Failed to load employees.');
        }
      });
  }

  private patchFromRecord(record: OffboardingRecord | null): void {
    if (!record) {
      return;
    }

    this.form.patchValue({
      employeeId: record.employeeId,
      offboardingType: record.offboardingType || 'RESIGNATION',
      reason: record.reason,
      lastWorkingDay: record.lastWorkingDay ? new Date(record.lastWorkingDay) : null,
      notes: record.notes || ''
    });
  }

  private toIsoDate(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }

    if (typeof value === 'string' && value.length >= 10) {
      return value.slice(0, 10);
    }

    return '';
  }
}
