import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErProcessService } from '../../services/er-process.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-intake-documents',
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
            <nz-option nzValue="CONFIDENTIAL" nzLabel="Confidential"></nz-option>
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
      <button nz-button nzType="primary" [nzLoading]="loading">Attach Evidence</button>
    </form>
  `
})
export class IntakeDocumentsComponent {
  @Input() intakeId!: number;
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
      visibility: ['CONFIDENTIAL', [Validators.required]],
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
      this.processService.addIntakeDocument(this.intakeId, payload).subscribe({
        next: () => {
          this.message.success('Document attached');
          this.loading = false;
          this.completed.emit();
        },
        error: () => {
          this.message.error('Failed to attach document');
          this.loading = false;
        }
      });
    }
  }
}
