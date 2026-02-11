import { Component, Input, Output, EventEmitter, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErProcessService } from '../../services/er-process.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-task-documents',
  standalone: false,
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
      <nz-form-item>
        <nz-form-label nzRequired>Document ID (UUID)</nz-form-label>
        <nz-form-control nzErrorTip="Required">
          <input nz-input formControlName="documentId" placeholder="UUID of uploaded document" />
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label nzRequired>Visibility</nz-form-label>
        <nz-form-control>
          <nz-select formControlName="visibility">
            <nz-option nzValue="INTERNAL" nzLabel="Internal"></nz-option>
            <nz-option nzValue="RESTRICTED" nzLabel="Restricted"></nz-option>
            <nz-option nzValue="PUBLIC" nzLabel="Public"></nz-option>
          </nz-select>
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label>Notes</nz-form-label>
        <nz-form-control>
          <textarea nz-input formControlName="notes" rows="2"></textarea>
        </nz-form-control>
      </nz-form-item>
      <button nz-button nzType="primary" [nzLoading]="loading()">Link Document</button>
    </form>
  `
})
export class TaskDocumentsComponent {
  @Input() taskId!: number;
  @Output() completed = new EventEmitter<void>();
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);

  constructor(
    private fb: FormBuilder,
    private processService: ErProcessService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      documentId: [null, [Validators.required]],
      visibility: ['INTERNAL', [Validators.required]],
      notes: ['']
    });
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      const val = this.form.value;
      const payload = {
        document: { id: val.documentId },
        visibility: val.visibility,
        notes: val.notes
      };
      this.processService.addTaskDocument(this.taskId, payload).subscribe({
        next: () => {
          this.message.success('Document linked');
          this.loading.set(false);
          this.completed.emit();
        },
        error: () => {
          this.message.error('Failed to link document');
          this.loading.set(false);
        }
      });
    }
  }
}
