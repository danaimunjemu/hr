import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  OffboardingTask,
  TaskCompletionPayload
} from '../../models/offboarding-task.model';

@Component({
  selector: 'app-tasks-board',
  standalone: false,
  templateUrl: './tasks-board.component.html',
  styleUrl: './tasks-board.component.scss'
})
export class TasksBoardComponent implements OnChanges {
  @Input() tasks: OffboardingTask[] = [];
  @Input() savingTaskId: string | null = null;
  @Output() completeTask = new EventEmitter<{ taskId: string; payload: TaskCompletionPayload }>();

  drawerVisible = false;
  selectedTask: OffboardingTask | null = null;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tasks'] || changes['savingTaskId']) {
      this.cdr.detectChanges();
    }
  }

  get totalCount(): number {
    return this.tasks.length;
  }

  get overdueCount(): number {
    return this.tasks.filter((item) => this.isOverdue(item)).length;
  }

  get ownerFilters(): Array<{ text: string; value: string }> {
    const values = Array.from(
      new Set(this.tasks.map((item) => item.taskOwner || 'Unassigned'))
    ).sort((a, b) => a.localeCompare(b));
    return values.map((value) => ({ text: value, value }));
  }

  get departmentFilters(): Array<{ text: string; value: string }> {
    const values = Array.from(new Set(this.tasks.map((item) => item.department))).sort((a, b) =>
      a.localeCompare(b)
    );
    return values.map((value) => ({ text: value, value }));
  }

  openCompleteDrawer(task: OffboardingTask): void {
    this.selectedTask = task;
    this.drawerVisible = true;
    this.cdr.detectChanges();
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.selectedTask = null;
    this.cdr.detectChanges();
  }

  submitComplete(payload: TaskCompletionPayload): void {
    if (!this.selectedTask) {
      return;
    }
    this.completeTask.emit({ taskId: this.selectedTask.taskId, payload });
    this.cdr.detectChanges();
  }

  isOverdue(task: OffboardingTask): boolean {
    if (task.completionStatus === 'COMPLETED' || !task.taskDeadline) {
      return false;
    }
    const due = new Date(task.taskDeadline);
    if (Number.isNaN(due.getTime())) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  }

  overdueDays(task: OffboardingTask): number {
    if (!this.isOverdue(task)) {
      return 0;
    }
    const due = new Date(task.taskDeadline);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.max(1, Math.floor((today.getTime() - due.getTime()) / msPerDay));
  }

  deadlineTone(task: OffboardingTask): 'error' | 'warning' | 'success' | 'default' {
    if (this.isOverdue(task)) {
      return 'error';
    }
    if (task.completionStatus === 'COMPLETED') {
      return 'success';
    }
    const due = new Date(task.taskDeadline);
    if (Number.isNaN(due.getTime())) {
      return 'default';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysLeft = Math.ceil((due.getTime() - today.getTime()) / msPerDay);
    return daysLeft <= 2 ? 'warning' : 'default';
  }

  statusFilterFn(
    selectedValues: ReadonlyArray<string>,
    item: OffboardingTask
  ): boolean {
    if (!selectedValues || selectedValues.length === 0) {
      return true;
    }
    return selectedValues.includes(item.completionStatus);
  }

  ownerFilterFn(
    selectedValues: ReadonlyArray<string>,
    item: OffboardingTask
  ): boolean {
    if (!selectedValues || selectedValues.length === 0) {
      return true;
    }
    return selectedValues.includes(item.taskOwner || 'Unassigned');
  }

  departmentFilterFn(
    selectedValues: ReadonlyArray<string>,
    item: OffboardingTask
  ): boolean {
    if (!selectedValues || selectedValues.length === 0) {
      return true;
    }
    return selectedValues.includes(item.department);
  }

}
