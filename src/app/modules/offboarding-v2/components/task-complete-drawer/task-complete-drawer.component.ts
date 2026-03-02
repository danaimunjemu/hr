import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Subject, takeUntil } from 'rxjs';
import {
  OffboardingTask,
  TaskCompletionPayload
} from '../../models/offboarding-task.model';
import { UserContextService } from '../../services/user-context.service';

interface TaskCompleteForm {
  completionDate: FormControl<string>;
  evidenceFilePath: FormControl<string | null>;
  systemName: FormControl<string | null>;
  accessRevoked: FormControl<boolean | null>;
  comment: FormControl<string | null>;
  taskOwnerId: FormControl<number>;
}

@Component({
  selector: 'app-task-complete-drawer',
  standalone: false,
  templateUrl: './task-complete-drawer.component.html',
  styleUrl: './task-complete-drawer.component.scss'
})
export class TaskCompleteDrawerComponent {
  @Input() visible = false;
  @Input() task: OffboardingTask | null = null;
  @Input() saving = false;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<TaskCompletionPayload>();

  readonly form: FormGroup<TaskCompleteForm>;
  private readonly destroy$ = new Subject<void>();
  private currentUserEmployeeId = 0;

  constructor(
    fb: FormBuilder,
    private readonly userContext: UserContextService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = fb.group<TaskCompleteForm>({
      completionDate: fb.nonNullable.control('', [Validators.required]),
      evidenceFilePath: fb.control<string | null>(null),
      systemName: fb.control<string | null>(null),
      accessRevoked: fb.control<boolean | null>(null),
      comment: fb.control<string | null>(null),
      taskOwnerId: fb.nonNullable.control(0, [Validators.required, Validators.min(0)])
    });

    this.userContext.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        const parsed = Number(user.employeeId);
        this.currentUserEmployeeId = Number.isNaN(parsed) ? 0 : parsed;
        this.form.controls.taskOwnerId.setValue(this.currentUserEmployeeId);
        this.cdr.detectChanges();
      });
  }

  ngOnChanges(): void {
    if (this.task) {
      const defaultComment = this.isOverdueTask()
        ? `Overdue completion. Capturing closure details for ${this.task.taskName}.`
        : this.task.comment || null;
      this.form.patchValue({
        completionDate: this.task.completionDate || new Date().toISOString().slice(0, 10),
        evidenceFilePath: this.task.evidenceFilePath || null,
        systemName: this.task.systemName || null,
        accessRevoked: this.task.accessRevoked ?? null,
        comment: defaultComment,
        taskOwnerId: this.currentUserEmployeeId || this.task.taskOwnerId || 0
      });
      this.applyTaskFieldRules();
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.form.patchValue({ evidenceFilePath: file.name });
    this.cdr.detectChanges();
    return false;
  };

  close(): void {
    this.closed.emit();
    this.cdr.detectChanges();
  }

  submit(): void {
    this.applyTaskFieldRules();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const requiresTechnical = this.showTechnicalFields();
    this.submitted.emit({
      completed: true,
      completionDate: value.completionDate,
      evidenceFilePath: value.evidenceFilePath || 'string',
      systemName: requiresTechnical ? value.systemName || 'string' : 'N/A',
      comment: value.comment || 'string',
      accessRevoked: requiresTechnical ? value.accessRevoked ?? true : true,
      taskOwnerId: this.currentUserEmployeeId || value.taskOwnerId || 0
    });
    this.cdr.detectChanges();
  }

  showTechnicalFields(): boolean {
    if (!this.task) {
      return false;
    }
    if (this.task.department === 'IT') {
      return true;
    }
    return /(access|system|email|vpn|account)/i.test(this.task.taskName || '');
  }

  isOverdueTask(): boolean {
    if (!this.task?.taskDeadline || this.task.completionStatus === 'COMPLETED') {
      return false;
    }
    const due = new Date(this.task.taskDeadline);
    if (Number.isNaN(due.getTime())) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  }

  overdueDays(): number {
    if (!this.task?.taskDeadline || !this.isOverdueTask()) {
      return 0;
    }
    const due = new Date(this.task.taskDeadline);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.max(1, Math.floor((today.getTime() - due.getTime()) / msPerDay));
  }

  get commentErrorTip(): string | undefined {
    return this.isOverdueTask() ? 'Comment is required for overdue tasks' : undefined;
  }

  private applyTaskFieldRules(): void {
    if (this.isOverdueTask()) {
      this.form.controls.comment.addValidators([Validators.required, Validators.minLength(8)]);
    } else {
      this.form.controls.comment.clearValidators();
    }
    this.form.controls.comment.updateValueAndValidity();

    if (this.showTechnicalFields()) {
      this.form.controls.systemName.addValidators([Validators.required]);
      this.form.controls.accessRevoked.addValidators([Validators.required]);
    } else {
      this.form.controls.systemName.clearValidators();
      this.form.controls.accessRevoked.clearValidators();
      this.form.patchValue({ systemName: null, accessRevoked: null });
    }

    this.form.controls.systemName.updateValueAndValidity();
    this.form.controls.accessRevoked.updateValueAndValidity();
    this.cdr.detectChanges();
  }
}
