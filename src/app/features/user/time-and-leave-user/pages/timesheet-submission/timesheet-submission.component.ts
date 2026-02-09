import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TimesheetService } from '../../../../time-and-leave/services/timesheet.service';
import { TimesheetEntry } from '../../../../time-and-leave/models/timesheet-entry.model';

@Component({
  selector: 'app-timesheet-submission',
  standalone: false,
  templateUrl: './timesheet-submission.component.html',
  styles: [`
    :host {
      display: block;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class TimesheetSubmissionComponent implements OnInit {
  loading = true;
  entries: TimesheetEntry[] = [];
  
  // Modal
  isVisible = false;
  isEditMode = false;
  isFormSubmitting = false;
  isBulkSubmitting = false;
  form: FormGroup;
  currentEntryId: number | null = null;

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
    this.loading = true;
    this.timesheetService.getAll().subscribe({
      next: (data) => {
        this.entries = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load timesheets', err);
        this.message.error('Failed to load timesheets');
        this.loading = false;
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentEntryId = null;
    this.form.reset({ breakMinutes: 0 });
    this.isVisible = true;
  }

  openEditModal(entry: TimesheetEntry): void {
    if (entry.status !== 'DRAFT' && entry.status !== 'REJECTED') {
      this.message.warning('Only Draft or Rejected entries can be edited.');
      return;
    }

    this.isEditMode = true;
    this.currentEntryId = entry.id;
    
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
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
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

    this.isFormSubmitting = true;
    const formValue = this.form.value;
    
    const payload: any = {
      workDate: this.dateToString(formValue.workDate),
      startTime: this.dateToTimeString(formValue.startTime),
      endTime: this.dateToTimeString(formValue.endTime),
      breakMinutes: formValue.breakMinutes,
      notes: formValue.notes,
      status: 'DRAFT'
    };

    if (this.isEditMode && this.currentEntryId) {
      payload.id = this.currentEntryId;
      this.timesheetService.update(this.currentEntryId, payload).subscribe({
        next: () => {
          this.message.success('Timesheet entry updated');
          this.isVisible = false;
          this.isFormSubmitting = false;
          this.loadData();
        },
        error: (err: any) => {
          this.message.error('Failed to update entry');
          this.isFormSubmitting = false;
        }
      });
    } else {
      this.timesheetService.create(payload).subscribe({
        next: () => {
          this.message.success('Timesheet entry created');
          this.isVisible = false;
          this.isFormSubmitting = false;
          this.loadData();
        },
        error: (err: any) => {
          this.message.error('Failed to create entry');
          this.isFormSubmitting = false;
        }
      });
    }
  }

  deleteEntry(id: number): void {
    this.timesheetService.delete(id).subscribe({
      next: () => {
        this.message.success('Entry deleted');
        this.loadData();
      },
      error: (err: any) => this.message.error('Failed to delete entry')
    });
  }

  submitEntry(id: number): void {
    this.timesheetService.submit(id).subscribe({
      next: () => {
        this.message.success('Timesheet submitted successfully');
        this.loadData();
      },
      error: (err: any) => this.message.error('Failed to submit timesheet')
    });
  }

  submitAll(): void {
    const draftEntries = this.entries.filter(e => e.status === 'DRAFT');
    if (draftEntries.length === 0) {
      this.message.info('No draft entries to submit.');
      return;
    }

    this.isBulkSubmitting = true;
    let completed = 0;
    let errors = 0;

    draftEntries.forEach(entry => {
      this.timesheetService.submit(entry.id).subscribe({
        next: () => {
          completed++;
          this.checkBulkSubmitCompletion(completed, errors, draftEntries.length);
        },
        error: () => {
          errors++;
          completed++; // Count as processed
          this.checkBulkSubmitCompletion(completed, errors, draftEntries.length);
        }
      });
    });
  }

  private checkBulkSubmitCompletion(completed: number, errors: number, total: number): void {
    if (completed === total) {
      this.isBulkSubmitting = false;
      if (errors === 0) {
        this.message.success(`Successfully submitted ${total} entries.`);
      } else if (errors === total) {
        this.message.error('Failed to submit entries.');
      } else {
        this.message.warning(`Submitted ${total - errors} entries, but ${errors} failed.`);
      }
      this.loadData();
    }
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
