import { Component, Input, Output, EventEmitter, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErProcessService } from '../../services/er-process.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-task-complete',
  standalone: false,
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
      <nz-form-item>
        <nz-form-label nzRequired>Completion Notes</nz-form-label>
        <nz-form-control nzErrorTip="Required">
          <textarea nz-input formControlName="notes" rows="3"></textarea>
        </nz-form-control>
      </nz-form-item>
      <button nz-button nzType="primary" [nzLoading]="loading()">Complete Task</button>
    </form>
  `
})
export class TaskCompleteComponent {
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
      notes: [null, [Validators.required]]
    });
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      this.processService.completeTask(this.taskId, this.form.value).subscribe({
        next: () => {
          this.message.success('Task completed');
          this.loading.set(false);
          this.completed.emit();
        },
        error: () => {
          this.message.error('Failed to complete task');
          this.loading.set(false);
        }
      });
    }
  }
}
