import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TimesheetService } from '../../services/timesheet.service';
import { Timesheet, TimesheetStatus } from '../../models/timesheet.model';

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
  workflowLoading: WritableSignal<boolean> = signal(false);
  timesheets: WritableSignal<Timesheet[]> = signal([]);

  constructor(
    private timesheetService: TimesheetService,
    private message: NzMessageService
  ) {}

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

  submitTimesheet(id?: number): void {
    if (!id) {
      return;
    }
    this.workflowLoading.set(true);
    this.timesheetService.submit(id).subscribe({
      next: () => {
        this.message.success('Timesheet submitted');
        this.workflowLoading.set(false);
        this.loadData();
      },
      error: () => {
        this.message.error('Failed to submit timesheet');
        this.workflowLoading.set(false);
      }
    });
  }

  approveTimesheet(id?: number): void {
    if (!id) {
      return;
    }
    this.workflowLoading.set(true);
    this.timesheetService.approve(id).subscribe({
      next: () => {
        this.message.success('Timesheet approved');
        this.workflowLoading.set(false);
        this.loadData();
      },
      error: () => {
        this.message.error('Failed to approve timesheet');
        this.workflowLoading.set(false);
      }
    });
  }

  rejectTimesheet(id?: number): void {
    if (!id) {
      return;
    }
    this.workflowLoading.set(true);
    this.timesheetService.reject(id).subscribe({
      next: () => {
        this.message.success('Timesheet rejected');
        this.workflowLoading.set(false);
        this.loadData();
      },
      error: () => {
        this.message.error('Failed to reject timesheet');
        this.workflowLoading.set(false);
      }
    });
  }

  getStatusColor(status: TimesheetStatus): string {
    switch (status) {
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'SUBMITTED':
        return 'blue';
      default:
        return 'default';
    }
  }

  getTimesheetNumber(timesheet: Timesheet): string {
    return timesheet.timesheetNumber || `TS-${timesheet.id || 'NEW'}`;
  }
}
