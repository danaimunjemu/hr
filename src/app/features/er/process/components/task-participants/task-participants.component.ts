import { Component, Input, Output, EventEmitter, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErProcessService } from '../../services/er-process.service';
import { EmployeesService, Employee } from '../../../../employees/services/employees.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-task-participants',
  standalone: false,
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Role</nz-form-label>
            <nz-form-control nzErrorTip="Required">
              <nz-select formControlName="role">
                <nz-option nzValue="WITNESS" nzLabel="Witness"></nz-option>
                <nz-option nzValue="COMPLAINANT" nzLabel="Complainant"></nz-option>
                <nz-option nzValue="RESPONDENT" nzLabel="Respondent"></nz-option>
                <nz-option nzValue="OTHER" nzLabel="Other"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Type</nz-form-label>
            <nz-form-control>
              <nz-radio-group formControlName="personType">
                <label nz-radio nzValue="EMPLOYEE">Employee</label>
                <!-- External not implemented in DTO/Service for this component yet -->
              </nz-radio-group>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>
      <nz-form-item>
        <nz-form-label nzRequired>Employee</nz-form-label>
        <nz-form-control nzErrorTip="Required">
          <nz-select formControlName="employee" nzShowSearch nzAllowClear>
            <nz-option *ngFor="let emp of employees()" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>
      <button nz-button nzType="primary" [nzLoading]="loading()">Add Participant</button>
    </form>
  `
})
export class TaskParticipantsComponent implements OnInit {
  @Input() taskId!: number;
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
      role: [null, [Validators.required]],
      personType: ['EMPLOYEE', [Validators.required]],
      employee: [null, [Validators.required]]
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
        role: val.role,
        personType: val.personType,
        employee: { id: val.employee }
      };
      this.processService.addTaskParticipant(this.taskId, payload).subscribe({
        next: () => {
          this.message.success('Participant added');
          this.loading.set(false);
          this.completed.emit();
        },
        error: () => {
          this.message.error('Failed to add participant');
          this.loading.set(false);
        }
      });
    }
  }
}
