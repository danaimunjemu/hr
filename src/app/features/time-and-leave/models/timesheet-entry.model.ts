import { Employee } from '../../employees/models/employee.model';

export type TimesheetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface TimesheetEntry {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  employee?: Employee;
  workDate: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  status: TimesheetStatus;
  notes?: string;
}
