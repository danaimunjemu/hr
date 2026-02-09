import { Component, OnInit } from '@angular/core';
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
  employees: Employee[] = [];
  loading = true;
  isVisible = false;
  isSubmitting = false;
  assignmentForm: FormGroup;
  selectedEmployee: Employee | null = null;

  workContracts: WorkContract[] = [];
  workScheduleRules: WorkScheduleRule[] = [];
  employeeGroups: EmployeeGroup[] = [];

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
    this.loading = true;
    this.employeesService.getEmployees().subscribe({
      next: (data: Employee[]) => {
        this.employees = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load employees', err);
        this.message.error('Failed to load employees');
        this.loading = false;
      }
    });
  }

  loadDependencies(): void {
    this.workContractService.getAll().subscribe(data => this.workContracts = data);
    this.workScheduleRuleService.getAll().subscribe(data => this.workScheduleRules = data);
    this.employeeGroupService.getAll().subscribe(data => this.employeeGroups = data);
  }

  openAssignmentModal(employee: Employee): void {
    this.selectedEmployee = employee;
    this.assignmentForm.patchValue({
      workContract: employee.workContract,
      workScheduleRule: employee.workScheduleRule,
      group: employee.group
    });
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    this.selectedEmployee = null;
    this.assignmentForm.reset();
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.id === o2.id : o1 === o2);

  handleOk(): void {
    if (this.assignmentForm.invalid || !this.selectedEmployee) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.assignmentForm.value;

    const payload = {
      id: this.selectedEmployee.id,
      workContract: formValue.workContract,
      workScheduleRule: formValue.workScheduleRule,
      group: formValue.group
    };

    this.employeesService.assignSettings(this.selectedEmployee.id, payload).subscribe({
      next: () => {
        this.message.success('Assignments updated successfully');
        this.isVisible = false;
        this.isSubmitting = false;
        this.loadData(); // Refresh table
      },
      error: (err: any) => {
        console.error('Failed to update assignments', err);
        this.message.error('Failed to update assignments');
        this.isSubmitting = false;
      }
    });
  }
}
