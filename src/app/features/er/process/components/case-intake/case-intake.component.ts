import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErProcessService } from '../../services/er-process.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-case-intake',
  standalone: false,
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Incident Date</nz-form-label>
            <nz-form-control nzErrorTip="Required">
              <nz-date-picker formControlName="incidentDateFrom" nzShowTime style="width: 100%"></nz-date-picker>
            </nz-form-control>
          </nz-form-item>
        </div>
        <div nz-col [nzSpan]="12">
          <nz-form-item>
            <nz-form-label nzRequired>Location</nz-form-label>
            <nz-form-control nzErrorTip="Required">
              <input nz-input formControlName="incidentLocation" />
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>
      <nz-form-item>
        <nz-form-label nzRequired>Detailed Description</nz-form-label>
        <nz-form-control nzErrorTip="Required">
          <textarea nz-input formControlName="detailedDescription" rows="4"></textarea>
        </nz-form-control>
      </nz-form-item>
      <button nz-button nzType="primary" [nzLoading]="loading">Add Intake</button>
    </form>
  `
})
export class CaseIntakeComponent {
  @Input() caseId!: number;
  @Output() completed = new EventEmitter<void>();
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private processService: ErProcessService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      incidentDateFrom: [null, [Validators.required]],
      incidentLocation: [null, [Validators.required]],
      detailedDescription: [null, [Validators.required]]
    });
  }

  submit() {
    if (this.form.valid) {
      this.loading = true;
      const val = this.form.value;
      const payload = {
        ...val,
        incidentDateFrom: val.incidentDateFrom.toISOString()
      };
      this.processService.addIntake(this.caseId, payload).subscribe({
        next: () => {
          this.message.success('Intake added successfully');
          this.loading = false;
          this.completed.emit();
        },
        error: () => {
          this.message.error('Failed to add intake');
          this.loading = false;
        }
      });
    }
  }
}
