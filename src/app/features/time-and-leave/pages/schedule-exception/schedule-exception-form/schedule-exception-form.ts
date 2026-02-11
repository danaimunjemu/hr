import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleExceptionService } from '../../../services/schedule-exception.service';
import { EmployeesService, Employee } from '../../../../employees/services/employees.service';
import { EmployeeGroupService } from '../../../services/employee-group.service';
import { ShiftDefinitionService } from '../../../services/shift-definition.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ScheduleException } from '../../../models/schedule-exception.model';
import { EmployeeGroup } from '../../../models/employee-group.model';
import { ShiftDefinition } from '../../../models/shift-definition.model';

@Component({
  selector: 'app-schedule-exception-form',
  standalone: false,
  templateUrl: './schedule-exception-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class ScheduleExceptionFormComponent implements OnInit {
  form: FormGroup;
  isEditMode: WritableSignal<boolean> = signal(false);
  exceptionId: WritableSignal<number | null> = signal(null);
  loading: WritableSignal<boolean> = signal(false);
  submitting: WritableSignal<boolean> = signal(false);
  employees: WritableSignal<Employee[]> = signal([]);
  employeeGroups: WritableSignal<EmployeeGroup[]> = signal([]);
  shiftDefinitions: WritableSignal<ShiftDefinition[]> = signal([]);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private exceptionService: ScheduleExceptionService,
    private employeesService: EmployeesService,
    private employeeGroupService: EmployeeGroupService,
    private shiftDefinitionService: ShiftDefinitionService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      targetType: ['EMPLOYEE', [Validators.required]],
      employee: [null],
      employeeGroup: [null],
      exceptionDate: [null, [Validators.required]],
      offDay: [true, [Validators.required]],
      shiftDefinition: [null]
    });
  }

  ngOnInit(): void {
    this.loadDependencies();
    this.route.params.subscribe(params => {
      if (params['id']) {
        const id = +params['id'];
        this.isEditMode.set(true);
        this.exceptionId.set(id);
        this.loadException(id);
      }
    });

    // Watch targetType changes
    this.form.get('targetType')?.valueChanges.subscribe(type => {
      if (type === 'EMPLOYEE') {
        this.form.get('employee')?.setValidators([Validators.required]);
        this.form.get('employeeGroup')?.clearValidators();
        this.form.get('employeeGroup')?.setValue(null);
      } else {
        this.form.get('employeeGroup')?.setValidators([Validators.required]);
        this.form.get('employee')?.clearValidators();
        this.form.get('employee')?.setValue(null);
      }
      this.form.get('employee')?.updateValueAndValidity();
      this.form.get('employeeGroup')?.updateValueAndValidity();
    });

    // Watch offDay changes
    this.form.get('offDay')?.valueChanges.subscribe(isOffDay => {
      if (!isOffDay) {
        this.form.get('shiftDefinition')?.setValidators([Validators.required]);
      } else {
        this.form.get('shiftDefinition')?.clearValidators();
        this.form.get('shiftDefinition')?.setValue(null);
      }
      this.form.get('shiftDefinition')?.updateValueAndValidity();
    });
  }

  loadDependencies(): void {
    this.employeesService.getEmployees().subscribe(data => this.employees.set(data));
    this.employeeGroupService.getAll().subscribe(data => this.employeeGroups.set(data));
    this.shiftDefinitionService.getAll().subscribe(data => this.shiftDefinitions.set(data));
  }

  loadException(id: number): void {
    this.loading.set(true);
    this.exceptionService.getById(id).subscribe({
      next: (exception) => {
        const targetType = exception.employee ? 'EMPLOYEE' : 'GROUP';
        
        this.form.patchValue({
          ...exception,
          targetType,
          exceptionDate: new Date(exception.exceptionDate),
          employee: exception.employee,
          employeeGroup: exception.employeeGroup,
          shiftDefinition: exception.shiftDefinition
        });

        this.loading.set(false);
      },
      error: (err: any) => {
        this.message.error('Failed to load exception details');
        this.loading.set(false);
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.id === o2.id : o1 === o2);

  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.submitting.set(true);
    const formValue = this.form.value;

    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const exceptionData: ScheduleException = {
      ...formValue,
      exceptionDate: formatDate(formValue.exceptionDate),
      // Clean up based on target type
      employee: formValue.targetType === 'EMPLOYEE' ? formValue.employee : null,
      employeeGroup: formValue.targetType === 'GROUP' ? formValue.employeeGroup : null,
    };

    const exceptionId = this.exceptionId();
    if (this.isEditMode() && exceptionId !== null) {
      this.exceptionService.update(exceptionId, exceptionData).subscribe({
        next: () => {
          this.message.success('Exception updated successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update exception');
          this.submitting.set(false);
        }
      });
    } else {
      this.exceptionService.create(exceptionData).subscribe({
        next: () => {
          this.message.success('Exception created successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to create exception');
          this.submitting.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
