import { Component, Input, Output, EventEmitter, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErProcessService } from '../../services/er-process.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-case-close',
  standalone: false,
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
      <nz-form-item>
        <nz-form-label nzRequired>Closing Notes</nz-form-label>
        <nz-form-control nzErrorTip="Required">
          <textarea nz-input formControlName="notes" rows="4" placeholder="Reason for closing..."></textarea>
        </nz-form-control>
      </nz-form-item>
      <button nz-button nzType="primary" nzDanger [nzLoading]="loading()">Close Case</button>
    </form>
  `
})
export class CaseCloseComponent {
  @Input() caseId!: number;
  @Output() completed = new EventEmitter<void>();
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);

  constructor(
    private fb: FormBuilder,
    private processService: ErProcessService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      notes: [null, [Validators.required]]
    });
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      this.processService.closeCase(this.caseId, this.form.value).subscribe({
        next: () => {
          this.message.success('Case closed successfully');
          this.loading.set(false);
          this.completed.emit();
        },
        error: () => {
          this.message.error('Failed to close case');
          this.loading.set(false);
        }
      });
    }
  }
}
