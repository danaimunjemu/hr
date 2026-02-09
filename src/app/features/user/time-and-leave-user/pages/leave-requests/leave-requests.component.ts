import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LeaveRequestService } from '../../../../time-and-leave/services/leave-request.service';
import { LeaveService } from '../../../../time-and-leave/services/leave.service';
import { LeaveRequest } from '../../../../time-and-leave/models/leave-request.model';
import { LeaveType } from '../../../../time-and-leave/models/leave-type.model';

@Component({
  selector: 'app-leave-requests',
  standalone: false,
  templateUrl: './leave-requests.component.html',
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
export class LeaveRequestsComponent implements OnInit {
  loading = true;
  requests: LeaveRequest[] = [];
  leaveTypes: LeaveType[] = [];

  // Modal
  isVisible = false;
  isEditMode = false;
  isSubmitting = false;
  form: FormGroup;
  currentRequestId: number | null = null;

  constructor(
    private leaveRequestService: LeaveRequestService,
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      dates: [null, [Validators.required]], // Range picker
      leaveType: [null, [Validators.required]],
      reason: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.loadLeaveTypes();
  }

  loadData(): void {
    this.loading = true;
    this.leaveRequestService.getAll().subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load leave requests', err);
        this.message.error('Failed to load leave requests');
        this.loading = false;
      }
    });
  }

  loadLeaveTypes(): void {
    this.leaveService.getAllTypes().subscribe({
      next: (data) => {
        this.leaveTypes = data;
      },
      error: (err: any) => {
        console.error('Failed to load leave types', err);
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentRequestId = null;
    this.form.reset();
    this.isVisible = true;
  }

  openEditModal(request: LeaveRequest): void {
    if (request.status !== 'PENDING') {
      this.message.warning('Only Pending requests can be edited.');
      return;
    }

    this.isEditMode = true;
    this.currentRequestId = request.id;

    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);

    this.form.patchValue({
      dates: [startDate, endDate],
      leaveType: request.leaveType.id,
      reason: request.reason
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

    this.isSubmitting = true;
    const formValue = this.form.value;
    const [startDate, endDate] = formValue.dates;

    const payload: any = {
      startDate: this.dateToString(startDate),
      endDate: this.dateToString(endDate),
      leaveType: { id: formValue.leaveType },
      reason: formValue.reason,
      status: 'PENDING'
    };

    if (this.isEditMode && this.currentRequestId) {
      payload.id = this.currentRequestId;
      this.leaveRequestService.update(this.currentRequestId, payload).subscribe({
        next: () => {
          this.message.success('Leave request updated');
          this.isVisible = false;
          this.isSubmitting = false;
          this.loadData();
        },
        error: (err: any) => {
          this.message.error('Failed to update request');
          this.isSubmitting = false;
        }
      });
    } else {
      this.leaveRequestService.create(payload).subscribe({
        next: () => {
          this.message.success('Leave request submitted');
          this.isVisible = false;
          this.isSubmitting = false;
          this.loadData();
        },
        error: (err: any) => {
          this.message.error('Failed to submit request');
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteRequest(id: number): void {
    this.leaveRequestService.delete(id).subscribe({
      next: () => {
        this.message.success('Request cancelled');
        this.loadData();
      },
      error: (err: any) => this.message.error('Failed to cancel request')
    });
  }

  // --- Helpers ---

  private dateToString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED': return 'green';
      case 'REJECTED': return 'red';
      case 'PENDING': return 'gold';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  }
}
