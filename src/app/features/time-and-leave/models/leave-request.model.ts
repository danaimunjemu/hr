import { LeaveType } from './leave-type.model';
import { Employee } from '../../employees/models/employee.model';

export type LeaveRequestStatus = 'CANCELLED' | 'WITHDRAWN' | 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | 'DRAFT' | 'SUBMITTED';

export interface LeaveRequest {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  employee?: Employee;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason: string;
  status: LeaveRequestStatus;
  rejectionReason?: string;
}
