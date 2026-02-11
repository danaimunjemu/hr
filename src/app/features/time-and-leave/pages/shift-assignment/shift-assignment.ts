import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Employee, EmployeesService } from '../../../employees/services/employees.service';
import { EmployeeGroup } from '../../models/employee-group.model';
import { WorkContract } from '../../models/work-contract.model';
import { WorkScheduleRule } from '../../models/work-schedule-rule.model';
import { EmployeeGroupService } from '../../services/employee-group.service';
import { WorkContractService } from '../../services/work-contract.service';
import { WorkScheduleRuleService } from '../../services/work-schedule-rule.service';

@Component({
  selector: 'app-shift-assignment',
  standalone: false,
  templateUrl: './shift-assignment.html',
  styles: [`
    :host {
      display: block;
    }
    .text-gray-400 {
      color: #9ca3af;
    }
  `]
})
export class ShiftAssignmentComponent implements OnInit {
  employees: WritableSignal<Employee[]> = signal([]);
  loading: WritableSignal<boolean> = signal(true);
  isVisible: WritableSignal<boolean> = signal(false);
  isSubmitting: WritableSignal<boolean> = signal(false);
  assignmentForm: FormGroup;
  selectedEmployee: WritableSignal<Employee | null> = signal(null);

  workContracts: WritableSignal<WorkContract[]> = signal([]);
  workScheduleRules: WritableSignal<WorkScheduleRule[]> = signal([]);
  employeeGroups: WritableSignal<EmployeeGroup[]> = signal([]);

  constructor(
    private employeesService: EmployeesService,
    private workContractService: WorkContractService,
    private workScheduleRuleService: WorkScheduleRuleService,
    private employeeGroupService: EmployeeGroupService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.assignmentForm = this.fb.group({
      workContract: [null],
      workScheduleRule: [null],
      group: [null]
    });
  }

  ngOnInit(): void {
    this.loadDependencies();
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.employeesService.getEmployees().subscribe({
      next: (data: Employee[]) => {
        this.employees.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load employees', err);
        this.message.error('Failed to load employees');
        this.loading.set(false);
      }
    });
  }

  loadDependencies(): void {
    this.workContractService.getAll().subscribe(data => this.workContracts.set(data));
    this.workScheduleRuleService.getAll().subscribe(data => this.workScheduleRules.set(data));
    this.employeeGroupService.getAll().subscribe(data => this.employeeGroups.set(data));
  }

  openAssignmentModal(employee: Employee): void {
    this.selectedEmployee.set(employee);
    this.assignmentForm.patchValue({
      workContract: employee.workContract,
      workScheduleRule: employee.workScheduleRule,
      group: employee.group
    });
    this.isVisible.set(true);
  }

  handleCancel(): void {
    this.isVisible.set(false);
    this.selectedEmployee.set(null);
    this.assignmentForm.reset();
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.id === o2.id : o1 === o2);

  handleOk(): void {
    const selectedEmployee = this.selectedEmployee();
    if (this.assignmentForm.invalid || !selectedEmployee) {
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.assignmentForm.value;

    const payload = {
      id: selectedEmployee.id,
      workContract: formValue.workContract,
      workScheduleRule: formValue.workScheduleRule,
      group: formValue.group
    };

    this.employeesService.assignSettings(selectedEmployee.id, payload).subscribe({
      next: () => {
        this.message.success('Assignments updated successfully');
        this.isVisible.set(false);
        this.isSubmitting.set(false);
        this.loadData(); // Refresh table
      },
      error: (err: any) => {
        console.error('Failed to update assignments', err);
        this.message.error('Failed to update assignments');
        this.isSubmitting.set(false);
      }
    });
  }
}
