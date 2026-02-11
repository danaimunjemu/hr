import { Component, Input, Output, EventEmitter, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErProcessService } from '../../services/er-process.service';
import { EmployeesService, Employee } from '../../../../employees/services/employees.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-case-outcome',
  standalone: false,
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Outcome Type</nz-form-label>
            <nz-form-control nzErrorTip="Required">
              <nz-select formControlName="outcomeType">
                <nz-option nzValue="NO_ACTION" nzLabel="No Action"></nz-option>
                <nz-option nzValue="WRITTEN_WARNING" nzLabel="Written Warning"></nz-option>
                <nz-option nzValue="DISMISSAL" nzLabel="Dismissal"></nz-option>
                <nz-option nzValue="OTHER" nzLabel="Other"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Decided By</nz-form-label>
            <nz-form-control nzErrorTip="Required">
              <nz-select formControlName="decidedBy" nzShowSearch nzAllowClear>
                <nz-option *ngFor="let emp of employees()" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>
      <nz-form-item>
        <nz-form-label nzRequired>Decision Date</nz-form-label>
        <nz-form-control nzErrorTip="Required">
          <nz-date-picker formControlName="decisionAt" nzShowTime style="width: 100%"></nz-date-picker>
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label nzRequired>Decision Summary</nz-form-label>
        <nz-form-control nzErrorTip="Required">
          <textarea nz-input formControlName="decisionSummary" rows="3"></textarea>
        </nz-form-control>
      </nz-form-item>
      <button nz-button nzType="primary" [nzLoading]="loading()">Record Outcome</button>
    </form>
  `
})
export class CaseOutcomeComponent implements OnInit {
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
      outcomeType: [null, [Validators.required]],
      decisionSummary: [null, [Validators.required]],
      decidedBy: [null, [Validators.required]],
      decisionAt: [new Date(), [Validators.required]]
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
        outcomeType: val.outcomeType,
        decisionSummary: val.decisionSummary,
        decidedBy: { id: val.decidedBy },
        decisionAt: val.decisionAt.toISOString()
      };
      this.processService.addOutcome(this.caseId, payload).subscribe({
        next: () => {
          this.message.success('Outcome recorded successfully');
          this.loading.set(false);
          this.completed.emit();
        },
        error: () => {
          this.message.error('Failed to record outcome');
          this.loading.set(false);
        }
      });
    }
  }
}
