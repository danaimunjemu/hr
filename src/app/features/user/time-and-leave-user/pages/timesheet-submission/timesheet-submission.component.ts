import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TimesheetService } from '../../../../time-and-leave/services/timesheet.service';
import { AuthService } from '../../../../authentication/services/auth';
import { Timesheet, TimesheetEntry, TimesheetLocalTime, TimesheetStatus } from '../../../../time-and-leave/models/timesheet.model';

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
  loading: WritableSignal<boolean> = signal(true);
  timesheets: WritableSignal<Timesheet[]> = signal([]);

  isCreateModalVisible: WritableSignal<boolean> = signal(false);
  isDetailsModalVisible: WritableSignal<boolean> = signal(false);
  isEntryModalVisible: WritableSignal<boolean> = signal(false);

  isSubmittingTimesheet: WritableSignal<boolean> = signal(false);
  isSubmittingEntry: WritableSignal<boolean> = signal(false);
  isSubmittingWorkflow: WritableSignal<boolean> = signal(false);

  selectedTimesheet: WritableSignal<Timesheet | null> = signal(null);
  editingEntryIndex: WritableSignal<number | null> = signal(null);

  createTimesheetForm: FormGroup;
  entryForm: FormGroup;

  constructor(
    private timesheetService: TimesheetService,
    private authService: AuthService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.createTimesheetForm = this.fb.group({
      periodStartDate: [null, [Validators.required]],
      periodEndDate: [null, [Validators.required]]
    });

    this.entryForm = this.fb.group({
      workDate: [null, [Validators.required]],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      entryType: ['REGULAR', [Validators.required]],
      projectCode: [''],
      taskCode: [''],
      workDescription: [''],
      location: [''],
      billable: [false],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.timesheetService.getAll().subscribe({
      next: (data: Timesheet[]) => {
        this.timesheets.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Failed to load timesheets');
        this.loading.set(false);
      }
    });
  }

  openCreateTimesheetModal(): void {
    this.createTimesheetForm.reset();
    this.isCreateModalVisible.set(true);
  }

  closeCreateTimesheetModal(): void {
    this.isCreateModalVisible.set(false);
  }

  createTimesheet(): void {
    if (this.createTimesheetForm.invalid) {
      Object.values(this.createTimesheetForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const employeeId = this.resolveCurrentEmployeeId();
    if (!employeeId) {
      this.message.error('Unable to resolve current user employee id');
      return;
    }

    const formValue = this.createTimesheetForm.value;
    const payload: Timesheet = {
      timesheetNumber: null,
      employee: { id: employeeId },
      periodStartDate: this.dateToString(formValue.periodStartDate),
      periodEndDate: this.dateToString(formValue.periodEndDate),
      status: 'DRAFT',
      entries: [],
      totalRegularHours: 0,
      totalOvertimeHours: 0,
      totalHours: 0
    };

    this.isSubmittingTimesheet.set(true);
    this.timesheetService.create(payload).subscribe({
      next: () => {
        this.message.success('Timesheet created');
        this.isCreateModalVisible.set(false);
        this.isSubmittingTimesheet.set(false);
        this.loadData();
      },
      error: () => {
        this.message.error('Failed to create timesheet');
        this.isSubmittingTimesheet.set(false);
      }
    });
  }

  openTimesheetDetails(timesheet: Timesheet): void {
    if (!timesheet.id) {
      return;
    }
    this.loading.set(true);
    this.timesheetService.getById(timesheet.id).subscribe({
      next: (data) => {
        this.selectedTimesheet.set(data);
        this.isDetailsModalVisible.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Failed to load timesheet details');
        this.loading.set(false);
      }
    });
  }

  closeTimesheetDetails(): void {
    this.isDetailsModalVisible.set(false);
    this.selectedTimesheet.set(null);
  }

  openEntryModal(entry?: TimesheetEntry, index?: number): void {
    const timesheet = this.selectedTimesheet();
    if (!timesheet || !this.canEdit(timesheet.status)) {
      return;
    }

    if (entry && index !== undefined) {
      this.editingEntryIndex.set(index);
      this.entryForm.patchValue({
        workDate: new Date(entry.workDate),
        startTime: this.localTimeToDate(entry.startTime),
        endTime: this.localTimeToDate(entry.endTime),
        entryType: entry.entryType,
        projectCode: entry.projectCode || '',
        taskCode: entry.taskCode || '',
        workDescription: entry.workDescription || '',
        location: entry.location || '',
        billable: entry.billable,
        notes: entry.notes || ''
      });
    } else {
      this.editingEntryIndex.set(null);
      this.entryForm.reset({
        entryType: 'REGULAR',
        billable: false
      });
    }

    this.isEntryModalVisible.set(true);
  }

  closeEntryModal(): void {
    this.isEntryModalVisible.set(false);
  }

  saveEntry(): void {
    const timesheet = this.selectedTimesheet();
    if (!timesheet || !timesheet.id || !this.canEdit(timesheet.status)) {
      return;
    }

    if (this.entryForm.invalid) {
      Object.values(this.entryForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const formValue = this.entryForm.value;
    const metrics = this.calculateEntryMetrics(formValue.startTime, formValue.endTime);

    const updatedEntry: TimesheetEntry = {
      ...(this.editingEntryIndex() !== null ? timesheet.entries[this.editingEntryIndex() as number] : {}),
      timesheet: { id: timesheet.id },
      workDate: this.dateToString(formValue.workDate),
      startTime: this.toLocalTimeString(formValue.startTime),
      endTime: this.toLocalTimeString(formValue.endTime),
      entryType: formValue.entryType,
      projectCode: formValue.projectCode || null,
      taskCode: formValue.taskCode || null,
      workDescription: formValue.workDescription || null,
      location: formValue.location || null,
      billable: !!formValue.billable,
      notes: formValue.notes || null,
      hoursWorked: metrics.hoursWorked,
      overtimeHours: metrics.overtimeHours
    };

    const updatedEntries = [...(timesheet.entries || [])];
    const editingIndex = this.editingEntryIndex();

    if (editingIndex !== null) {
      updatedEntries[editingIndex] = updatedEntry;
    } else {
      updatedEntries.push(updatedEntry);
    }

    const payload = this.buildTimesheetPayload(timesheet, updatedEntries);
    this.isSubmittingEntry.set(true);
    this.timesheetService.update(timesheet.id, payload).subscribe({
      next: (updatedTimesheet) => {
        this.message.success(editingIndex !== null ? 'Entry updated' : 'Entry added');
        this.selectedTimesheet.set(updatedTimesheet);
        this.isEntryModalVisible.set(false);
        this.isSubmittingEntry.set(false);
        this.loadData();
      },
      error: () => {
        this.message.error('Failed to save entry');
        this.isSubmittingEntry.set(false);
      }
    });
  }

  deleteEntry(index: number): void {
    const timesheet = this.selectedTimesheet();
    if (!timesheet || !timesheet.id || !this.canEdit(timesheet.status)) {
      return;
    }

    const updatedEntries = [...(timesheet.entries || [])];
    updatedEntries.splice(index, 1);

    const payload = this.buildTimesheetPayload(timesheet, updatedEntries);
    this.isSubmittingEntry.set(true);
    this.timesheetService.update(timesheet.id, payload).subscribe({
      next: () => {
        this.message.success('Entry deleted');
        this.isSubmittingEntry.set(false);
        this.openTimesheetDetails(timesheet);
        this.loadData();
      },
      error: () => {
        this.message.error('Failed to delete entry');
        this.isSubmittingEntry.set(false);
      }
    });
  }

  deleteTimesheet(timesheetId: number): void {
    this.timesheetService.delete(timesheetId).subscribe({
      next: () => {
        this.message.success('Timesheet deleted');
        this.loadData();
      },
      error: () => this.message.error('Failed to delete timesheet')
    });
  }

  submitTimesheet(timesheet: Timesheet): void {
    if (!timesheet.id || !this.canSubmit(timesheet) || timesheet.entries.length === 0) {
      return;
    }

    this.isSubmittingWorkflow.set(true);
    this.timesheetService.submit(timesheet.id).subscribe({
      next: () => {
        this.message.success('Timesheet submitted');
        const selected = this.selectedTimesheet();
        if (selected?.id === timesheet.id) {
          this.openTimesheetDetails(timesheet);
        }
        this.loadData();
        this.isSubmittingWorkflow.set(false);
      },
      error: () => {
        this.message.error('Failed to submit timesheet');
        this.isSubmittingWorkflow.set(false);
      }
    });
  }

  canEdit(status: TimesheetStatus): boolean {
    return status === 'DRAFT' || status === 'REJECTED';
  }

  canSubmit(timesheet: Timesheet): boolean {
    return this.canEdit(timesheet.status);
  }

  getTimesheetNumber(timesheet: Timesheet): string {
    return timesheet.timesheetNumber || `TS-${timesheet.id || 'NEW'}`;
  }

  getSelectedTimesheetTitle(): string {
    const selected = this.selectedTimesheet();
    return selected ? `Timesheet: ${this.getTimesheetNumber(selected)}` : 'Timesheet Details';
  }

  formatTime(time: TimesheetLocalTime): string {
    if (typeof time === 'string') {
      return time.slice(0, 5);
    }
    const hour = time.hour.toString().padStart(2, '0');
    const minute = time.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }

  private resolveCurrentEmployeeId(): number | null {
    const currentUser = this.authService.currentUser();
    const id = currentUser.employee.id;
    console.log(id)
    return typeof id === 'number' ? id : null;
  }

  private toLocalTimeString(date: Date): string {
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}:00`;
  }

  private localTimeToDate(time: TimesheetLocalTime): Date {
    if (typeof time === 'string') {
      const [hour = '0', minute = '0', second = '0'] = time.split(':');
      const dateFromString = new Date();
      dateFromString.setHours(+hour, +minute, +second, 0);
      return dateFromString;
    }

    const date = new Date();
    date.setHours(time.hour, time.minute, time.second || 0, 0);
    return date;
  }

  private calculateEntryMetrics(startTime: Date, endTime: Date): { hoursWorked: number; overtimeHours: number } {
    const millisecondsWorked = endTime.getTime() - startTime.getTime();
    const totalHours = millisecondsWorked > 0 ? millisecondsWorked / (1000 * 60 * 60) : 0;
    const hoursWorked = Number(totalHours.toFixed(2));
    const overtimeHours = Number(Math.max(0, hoursWorked - 8).toFixed(2));
    return { hoursWorked, overtimeHours };
  }

  private buildTimesheetPayload(timesheet: Timesheet, entries: TimesheetEntry[]): Timesheet {
    const totalHours = Number(entries.reduce((sum, item) => sum + (item.hoursWorked || 0), 0).toFixed(2));
    const totalOvertimeHours = Number(entries.reduce((sum, item) => sum + (item.overtimeHours || 0), 0).toFixed(2));
    const totalRegularHours = Number((totalHours - totalOvertimeHours).toFixed(2));

    return {
      id: timesheet.id,
      timesheetNumber: timesheet.timesheetNumber || null,
      employee: { id: timesheet.employee.id },
      periodStartDate: timesheet.periodStartDate,
      periodEndDate: timesheet.periodEndDate,
      status: timesheet.status,
      entries: entries.map((entry) => ({
        id: entry.id,
        timesheet: { id: timesheet.id as number },
        workDate: entry.workDate,
        startTime: entry.startTime,
        endTime: entry.endTime,
        entryType: entry.entryType,
        projectCode: entry.projectCode || null,
        taskCode: entry.taskCode || null,
        workDescription: entry.workDescription || null,
        location: entry.location || null,
        billable: !!entry.billable,
        notes: entry.notes || null,
        hoursWorked: entry.hoursWorked,
        overtimeHours: entry.overtimeHours
      })),
      totalRegularHours,
      totalOvertimeHours,
      totalHours,
      submittedDate: timesheet.submittedDate || null
    };
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
