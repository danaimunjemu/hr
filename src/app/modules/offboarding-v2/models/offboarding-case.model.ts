export type InitiatorType =
  | 'HR'
  | 'LINE_MANAGER'
  | 'SYSTEM_TRIGGERED'
  | 'EMPLOYEE_SELF_SERVICE';

export type OffboardingType =
  | 'RESIGNATION'
  | 'RETIREMENT'
  | 'DISMISSAL'
  | 'CONTRACT_EXPIRY'
  | 'RETRENCHMENT'
  | 'DEATH'
  | 'MUTUAL_SEPARATION';

export type OffboardingStatus =
  | 'INITIATED'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'READY_FOR_COMPLETION'
  | 'COMPLETED';

export interface EmployeeSnapshot {
  employeeId: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  department: string;
  jobTitle: string;
  manager: string;
  employeeType: string;
  startDate: string;
  yearsOfService: number;
}

export interface OffboardingCase {
  id:string;
  offboardingId: string;
  offboardingRecordId?: number;
  offboardingStatus?: string;
  caseId: string;
  employeeId: string;
  initiator: InitiatorType;
  status: OffboardingStatus;
  employee: EmployeeSnapshot;
  lastWorkingDate: string;
  noticePeriodStart?: string;
  noticePeriodEnd?: string;
  offboardingType: OffboardingType;
  reason: string;
  comments?: string;
  exitInterviewRequested: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OffboardingCaseSummary {
  id:string;
  offboardingId: string;
  offboardingRecordId?: number;
  caseId: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  department: string;
  offboardingType: OffboardingType;
  lastWorkingDate: string;
  status: OffboardingStatus;
  createdAt: string;
}

export interface CreateOffboardingPayload {
  employeeId: string;
  initiator: InitiatorType;
  exitDate: string;
  noticePeriodStart?: string;
  noticePeriodEnd?: string;
  offboardingType: OffboardingType;
  reason: string;
  comments?: string;
  exitInterviewRequested: boolean;
}
