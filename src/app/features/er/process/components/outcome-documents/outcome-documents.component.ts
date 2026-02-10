import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErProcessService } from '../../services/er-process.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-outcome-documents',
  standalone: false,
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
      <nz-form-item>
        <nz-form-label nzRequired>Document ID</nz-form-label>
        <nz-form-control nzErrorTip="Required">
          <input nz-input formControlName="documentId" />
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label nzRequired>Visibility</nz-form-label>
        <nz-form-control>
          <nz-select formControlName="visibility">
            <nz-option nzValue="RESTRICTED" nzLabel="Restricted"></nz-option>
            <nz-option nzValue="INTERNAL" nzLabel="Internal"></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label>Notes</nz-form-label>
        <nz-form-control>
          <textarea nz-input formControlName="notes" rows="2"></textarea>
        </nz-form-control>
      </nz-form-item>
      <button nz-button nzType="primary" [nzLoading]="loading">Attach Report</button>
    </form>
  `
})
export class OutcomeDocumentsComponent {
  @Input() outcomeId!: number;
  @Output() completed = new EventEmitter<void>();
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private processService: ErProcessService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      documentId: [null, [Validators.required]],
      visibility: ['RESTRICTED', [Validators.required]],
      notes: ['']
    });
  }

  submit() {
    if (this.form.valid) {
      this.loading = true;
      const val = this.form.value;
      const payload = {
        document: { id: val.documentId },
        visibility: val.visibility,
        notes: val.notes
      };
      this.processService.addOutcomeDocument(this.outcomeId, payload).subscribe({
        next: () => {
          this.message.success('Report attached');
          this.loading = false;
          this.completed.emit();
        },
        error: () => {
          this.message.error('Failed to attach report');
          this.loading = false;
        }
      });
    }
  }
}
