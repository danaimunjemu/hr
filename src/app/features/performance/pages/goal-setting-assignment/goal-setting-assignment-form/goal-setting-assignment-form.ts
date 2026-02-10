import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { GoalSettingService } from '../../../services/goal-setting.service';
import { PerformanceGoalTemplateService } from '../../../services/performance-goal-template.service';
import { PerformanceCycleService } from '../../../services/performance-cycle.service';
import { EmployeeService } from '../../../services/employee.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PerformanceGoalTemplate } from '../../../models/performance-goal-template.model';
import { PerformanceCycle } from '../../../models/performance-cycle.model';
import { Employee, Position } from '../../../models/employee.model';
import { AssignmentType, GoalSetting } from '../../../models/goal-setting.model';

@Component({
  selector: 'app-goal-setting-assignment-form',
  standalone: false,
  templateUrl: './goal-setting-assignment-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class GoalSettingAssignmentFormComponent implements OnInit {
  form: FormGroup;
  templates: WritableSignal<PerformanceGoalTemplate[]> = signal([]);
  employees: WritableSignal<Employee[]> = signal([]);
  departments: WritableSignal<Position[]> = signal([]);
  loadingTemplates: WritableSignal<boolean> = signal(false);
  loadingEmployees: WritableSignal<boolean> = signal(false);
  submitting: WritableSignal<boolean> = signal(false);
  assignedGoals: WritableSignal<GoalSetting[]> = signal([]);
  showResults: WritableSignal<boolean> = signal(false);

  assignmentTypeOptions = [
    { label: 'All Employees', value: AssignmentType.ALL_EMPLOYEES },
    { label: 'Department', value: AssignmentType.DEPARTMENT }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private goalSettingService: GoalSettingService,
    private goalTemplateService: PerformanceGoalTemplateService,
    private employeeService: EmployeeService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      templateId: [null, [Validators.required]],
      assignmentMode: ['employees'],
      employeeIds: [[]],
      assignmentType: [null],
      departmentIds: [[]]
    });
  }

  ngOnInit(): void {
    this.loadTemplates();
    this.loadEmployees();

    this.form.get('assignmentMode')?.valueChanges.subscribe(mode => {
      this.clearAssignmentFields();
    });
  }

  loadTemplates(): void {
    this.loadingTemplates.set(true);
    this.goalTemplateService.getAll()
      .pipe(finalize(() => this.loadingTemplates.set(false)))
      .subscribe({
        next: (data) => this.templates.set(data),
        error: () => this.message.error('Failed to load templates')
      });
  }

  loadEmployees(): void {
    this.loadingEmployees.set(true);
    this.employeeService.getAll()
      .pipe(finalize(() => this.loadingEmployees.set(false)))
      .subscribe({
        next: (data) => {
          this.employees.set(data);
          this.extractDepartments(data);
        },
        error: () => this.message.error('Failed to load employees')
      });
  }

  extractDepartments(employees: Employee[]): void {
    const deptMap = new Map<number, Position>();
    employees.forEach(emp => {
      if (emp.position) {
        deptMap.set(emp.position.id, emp.position);
      }
    });
    this.departments.set(Array.from(deptMap.values()));
  }

  clearAssignmentFields(): void {
    this.form.patchValue({
      employeeIds: [],
      assignmentType: null,
      departmentIds: []
    });
  }

  getEmployeeLabel(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName} (${employee.employeeNumber})`;
  }

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

    const formValue = this.form.value;
    const mode = formValue.assignmentMode;
    const templateId = formValue.templateId;

    let requestBody: any = {};

    if (mode === 'employees' && formValue.employeeIds.length > 0) {
      requestBody.employeeIds = formValue.employeeIds;
    } else if (mode === 'assignmentType' && formValue.assignmentType) {
      requestBody.assignmentType = formValue.assignmentType;
    } else if (mode === 'departments' && formValue.departmentIds.length > 0) {
      requestBody.departmentIds = formValue.departmentIds;
    } else {
      this.message.error('Please select assignment criteria');
      return;
    }

    this.submitting.set(true);
    this.goalSettingService.assignGoalSetting(templateId, requestBody)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (goals) => {
          this.message.success('Goal settings assigned successfully');
          this.assignedGoals.set(goals);
          this.showResults.set(true);
        },
        error: () => this.message.error('Failed to assign goal settings')
      });
  }

  onCancel(): void {
    this.router.navigate(['/app/performance/goal-settings']);
  }

  onBackToForm(): void {
    this.showResults.set(false);
    this.assignedGoals.set([]);
  }

  onGoToList(): void {
    this.router.navigate(['/app/performance/goal-settings']);
  }
}
