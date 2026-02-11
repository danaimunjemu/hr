// trigger rebuild
import { Component, Input, Output, EventEmitter, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErProcessService } from '../../services/er-process.service';
import { EmployeesService, Employee } from '../../../../employees/services/employees.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-case-assign',
  standalone: false,
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
      <nz-form-item>
        <nz-form-label nzRequired>Assign To</nz-form-label>
        <nz-form-control nzErrorTip="Select user">
          <nz-select formControlName="assignedToUser" nzShowSearch nzAllowClear nzPlaceHolder="Select user">
            <nz-option *ngFor="let emp of employees()" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label>Notes</nz-form-label>
        <nz-form-control>
          <textarea nz-input formControlName="notes" rows="3"></textarea>
        </nz-form-control>
      </nz-form-item>
      <button nz-button nzType="primary" [nzLoading]="loading()">Assign Case</button>
    </form>
  `
})
export class CaseAssignComponent implements OnInit {
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
      assignedToUser: [null, [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.employeeService.getAll().subscribe(data => this.employees.set(data));
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      const payload = {
        assignedToUser: { id: this.form.value.assignedToUser },
        notes: this.form.value.notes
      };
      this.processService.assignCase(this.caseId, payload).subscribe({
        next: () => {
          this.message.success('Case assigned successfully');
          this.loading.set(false);
          this.completed.emit();
        },
        error: () => {
          this.message.error('Failed to assign case');
          this.loading.set(false);
        }
      });
    }
  }
}
