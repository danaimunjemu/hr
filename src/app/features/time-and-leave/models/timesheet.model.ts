export type TimesheetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface TimesheetTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export type TimesheetLocalTime = string | TimesheetTime;

export interface TimesheetEmployeeRef {
  id: number;
  firstName?: string;
  lastName?: string;
}

export interface TimesheetRef {
  id: number;
}

export interface TimesheetEntry {
  id?: number;
  timesheet?: TimesheetRef;
  workDate: string;
  startTime: TimesheetLocalTime;
  endTime: TimesheetLocalTime;
  entryType: string;
  projectCode?: string | null;
  taskCode?: string | null;
  workDescription?: string | null;
  location?: string | null;
  billable: boolean;
  notes?: string | null;
  hoursWorked: number;
  overtimeHours: number;
}

export interface Timesheet {
  id?: number;
  timesheetNumber: string | null;
  employee: TimesheetEmployeeRef;
  periodStartDate: string;
  periodEndDate: string;
  status: TimesheetStatus;
  entries: TimesheetEntry[];
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalHours: number;
  submittedDate?: string | null;
}
