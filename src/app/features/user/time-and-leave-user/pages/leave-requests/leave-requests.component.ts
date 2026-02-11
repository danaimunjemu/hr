import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LeaveRequestService } from '../../../../time-and-leave/services/leave-request.service';
import { LeaveService } from '../../../../time-and-leave/services/leave.service';
import { AuthService } from '../../../../authentication/services/auth';
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
  loading: WritableSignal<boolean> = signal(true);
  requests: WritableSignal<LeaveRequest[]> = signal([]);
  leaveTypes: WritableSignal<LeaveType[]> = signal([]);

  // Modal
  isVisible: WritableSignal<boolean> = signal(false);
  isEditMode: WritableSignal<boolean> = signal(false);
  isSubmitting: WritableSignal<boolean> = signal(false);
  form: FormGroup;
  currentRequestId: WritableSignal<number | null> = signal(null);

  constructor(
    private leaveRequestService: LeaveRequestService,
    private leaveService: LeaveService,
    private authService: AuthService,
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
    this.loading.set(true);
    this.leaveRequestService.getAll().subscribe({
      next: (data) => {
        this.requests.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load leave requests', err);
        this.message.error('Failed to load leave requests');
        this.loading.set(false);
      }
    });
  }

  loadLeaveTypes(): void {
    this.leaveService.getAllTypes().subscribe({
      next: (data) => {
        this.leaveTypes.set(data);
      },
      error: (err: any) => {
        console.error('Failed to load leave types', err);
      }
    });
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.currentRequestId.set(null);
    this.form.reset();
    this.isVisible.set(true);
  }

  openEditModal(request: LeaveRequest): void {
    if (request.status !== 'DRAFT') {
      this.message.warning('Only Pending requests can be edited.');
      return;
    }

    this.isEditMode.set(true);
    this.currentRequestId.set(request.id);

    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);

    this.form.patchValue({
      dates: [startDate, endDate],
      leaveType: request.leaveType.id,
      reason: request.reason
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
    const [startDate, endDate] = formValue.dates;
    const employeeId = this.resolveCurrentEmployeeId();
    if (!employeeId) {
      this.message.error('Unable to resolve current user employee id');
      this.isSubmitting.set(false);
      return;
    }

    const payload: any = {
      employee: { id: employeeId },
      startDate: this.dateToString(startDate),
      endDate: this.dateToString(endDate),
      leaveType: { id: formValue.leaveType },
      reason: formValue.reason,
      status: 'DRAFT'
    };

    const currentRequestId = this.currentRequestId();
    if (this.isEditMode() && currentRequestId !== null) {
      payload.id = currentRequestId;
      this.leaveRequestService.update(currentRequestId, payload).subscribe({
        next: () => {
          this.message.success('Leave request updated');
          this.isVisible.set(false);
          this.isSubmitting.set(false);
          this.loadData();
        },
        error: (err: any) => {
          this.message.error('Failed to update request');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.leaveRequestService.create(payload).subscribe({
        next: () => {
          this.message.success('Leave request submitted');
          this.isVisible.set(false);
          this.isSubmitting.set(false);
          this.loadData();
        },
        error: (err: any) => {
          this.message.error('Failed to submit request');
          this.isSubmitting.set(false);
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

  private resolveCurrentEmployeeId(): number | null {
    const currentUser = this.authService.currentUser();
    const id = currentUser.employee.id;
    return typeof id === 'number' ? id : null;
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
