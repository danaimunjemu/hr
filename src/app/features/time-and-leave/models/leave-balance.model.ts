import { Employee } from '../../employees/models/employee.model';
import { LeaveType } from './leave-type.model';

export interface LeaveBalance {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  employee: Employee;
  leaveType: LeaveType;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}
