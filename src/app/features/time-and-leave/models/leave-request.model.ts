import { LeaveType } from './leave-type.model';
import { Employee } from '../../employees/models/employee.model';

export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

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
