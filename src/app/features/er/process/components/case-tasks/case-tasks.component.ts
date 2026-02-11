import { Component, Input, Output, EventEmitter, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErProcessService } from '../../services/er-process.service';
import { EmployeesService, Employee } from '../../../../employees/services/employees.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-case-tasks',
  standalone: false,
  template: `
    <nz-card nzTitle="Add New Task">
      <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Title</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <input nz-input formControlName="title" placeholder="Task title" />
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Type</nz-form-label>
              <nz-form-control>
                <nz-select formControlName="taskType">
                  <nz-option nzValue="INVESTIGATION" nzLabel="Investigation"></nz-option>
                  <nz-option nzValue="MEETING" nzLabel="Meeting"></nz-option>
                  <nz-option nzValue="REVIEW" nzLabel="Review"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Assigned To</nz-form-label>
              <nz-form-control nzErrorTip="Select user">
                <nz-select formControlName="assignedTo" nzShowSearch nzAllowClear>
                  <nz-option *ngFor="let emp of employees()" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Due Date</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-date-picker formControlName="dueAt" nzShowTime style="width: 100%"></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
        <nz-form-item>
          <nz-form-label>Description</nz-form-label>
          <nz-form-control>
            <textarea nz-input formControlName="description" rows="2"></textarea>
          </nz-form-control>
        </nz-form-item>
        <button nz-button nzType="primary" [nzLoading]="loading()">Create Task</button>
      </form>
    </nz-card>
  `
})
export class CaseTasksComponent implements OnInit {
  @Input() caseId!: number;
  @Output() completed = new EventEmitter<void>();
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);
  employees: WritableSignal<Employee[]> = signal([]);

  constructor(
    private fb: FormBuilder,
    private processService: ErProcessService,
    private employeeService: EmployeesService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      title: [null, [Validators.required]],
      taskType: ['INVESTIGATION', [Validators.required]],
      assignedTo: [null, [Validators.required]],
      dueAt: [null, [Validators.required]],
      description: ['']
    });
  }

  ngOnInit() {
    this.employeeService.getAll().subscribe(data => this.employees.set(data));
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      const val = this.form.value;
      const payload = {
        title: val.title,
        taskType: val.taskType,
        assignedTo: { id: val.assignedTo },
        dueAt: val.dueAt.toISOString(),
        description: val.description
      };
      this.processService.addTask(this.caseId, payload).subscribe({
        next: () => {
          this.message.success('Task created successfully');
          this.form.reset({ taskType: 'INVESTIGATION' });
          this.loading.set(false);
          this.completed.emit();
        },
        error: () => {
          this.message.error('Failed to create task');
          this.loading.set(false);
        }
      });
    }
  }
}
