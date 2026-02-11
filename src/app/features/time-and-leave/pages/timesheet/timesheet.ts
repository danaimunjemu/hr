import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TimesheetService } from '../../services/timesheet.service';
import { TimesheetEntry } from '../../models/timesheet-entry.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-timesheet',
  standalone: false,
  templateUrl: './timesheet.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class TimesheetComponent implements OnInit {
  loading: WritableSignal<boolean> = signal(true);
  entries: WritableSignal<TimesheetEntry[]> = signal([]);
  
  // Modal & Form
  isVisible: WritableSignal<boolean> = signal(false);
  isSubmitting: WritableSignal<boolean> = signal(false);
  isEditMode: WritableSignal<boolean> = signal(false);
  currentEntryId: WritableSignal<number | null> = signal(null);
  form: FormGroup;

  constructor(
    private timesheetService: TimesheetService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      workDate: [null, [Validators.required]],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      breakMinutes: [0, [Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.timesheetService.getAll().subscribe({
      next: (data: TimesheetEntry[]) => {
        this.entries.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load timesheets', err);
        this.message.error('Failed to load timesheets');
        this.loading.set(false);
      }
    });
  }

  // --- Actions ---

  openAddModal(): void {
    this.isEditMode.set(false);
    this.currentEntryId.set(null);
    this.form.reset({ breakMinutes: 0 });
    this.isVisible.set(true);
  }

  openEditModal(entry: TimesheetEntry): void {
    this.isEditMode.set(true);
    this.currentEntryId.set(entry.id);
    
    // Convert strings to Date objects for UI components
    const workDate = new Date(entry.workDate);
    const startTime = this.timeStringToDate(entry.startTime);
    const endTime = this.timeStringToDate(entry.endTime);

    this.form.patchValue({
      workDate: workDate,
      startTime: startTime,
      endTime: endTime,
      breakMinutes: entry.breakMinutes,
      notes: entry.notes
    });
    this.isVisible.set(true);
  }

  handleCancel(): void {
    this.isVisible.set(false);
  }

  handleOk(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.form.value;
    
    // Convert Date objects back to strings
    const payload: any = {
      workDate: this.dateToString(formValue.workDate),
      startTime: this.dateToTimeString(formValue.startTime),
      endTime: this.dateToTimeString(formValue.endTime),
      breakMinutes: formValue.breakMinutes,
      notes: formValue.notes
    };

    const currentEntryId = this.currentEntryId();
    if (this.isEditMode() && currentEntryId !== null) {
      // Preserve other fields? The backend usually handles partial updates or full replacements.
      // We'll send what we have.
      payload.id = currentEntryId;
      // Status isn't changed here usually, or stays as is.

      this.timesheetService.update(currentEntryId, payload).subscribe({
        next: () => {
          this.message.success('Entry updated');
          this.isVisible.set(false);
          this.isSubmitting.set(false);
          this.loadData();
        },
        error: () => {
          this.message.error('Failed to update entry');
          this.isSubmitting.set(false);
        }
      });
    } else {
      payload.status = 'DRAFT'; // Default status
      this.timesheetService.create(payload).subscribe({
        next: () => {
          this.message.success('Entry created');
          this.isVisible.set(false);
          this.isSubmitting.set(false);
          this.loadData();
        },
        error: () => {
          this.message.error('Failed to create entry');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  submitEntry(id: number): void {
    this.timesheetService.submit(id).subscribe({
      next: () => {
        this.message.success('Timesheet submitted');
        this.loadData();
      },
      error: () => this.message.error('Failed to submit timesheet')
    });
  }

  approveEntry(id: number): void {
    this.timesheetService.approve(id).subscribe({
      next: () => {
        this.message.success('Timesheet approved');
        this.loadData();
      },
      error: () => this.message.error('Failed to approve timesheet')
    });
  }

  rejectEntry(id: number): void {
    this.timesheetService.reject(id).subscribe({
      next: () => {
        this.message.success('Timesheet rejected');
        this.loadData();
      },
      error: () => this.message.error('Failed to reject timesheet')
    });
  }

  // --- Helpers ---

  private timeStringToDate(timeStr: string): Date {
    const d = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  private dateToTimeString(date: Date): string {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private dateToString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED': return 'green';
      case 'REJECTED': return 'red';
      case 'SUBMITTED': return 'blue';
      default: return 'default';
    }
  }
}
