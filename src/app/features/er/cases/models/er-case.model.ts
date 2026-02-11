export type CaseType = 'MISCONDUCT' | 'GRIEVANCE' | 'PERFORMANCE' | 'MEDICAL' | 'OTHER';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Confidentiality = 'NORMAL' | 'RESTRICTED' | 'CONFIDENTIAL';
export type CaseStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'TRIAGE' | 'IN_PROGRESS';
export type ReporterType = 'MANAGER' | 'EMPLOYEE' | 'HR' | 'ANONYMOUS';

export interface EmployeeRef {
  id: number;
  firstName?: string;
  lastName?: string;
}

export interface ErCase {
  id: number;
  caseNumber?: string;
  caseType: CaseType;
  priority: Priority;
  confidentiality: Confidentiality;
  status?: CaseStatus;
  currentStageCode?: string;
  reporterType: ReporterType;
  title: string;
  summary: string;
  subjectEmployee: EmployeeRef;
  reporterEmployee: EmployeeRef;
  assignedToUser?: EmployeeRef; // Added based on table column requirement, though not in example DTO
  createdOn?: string;
  company?: { id: number };
  intake?: import('../../intakes/models/er-intake.model').ErIntake | null;
  outcome?: import('../../outcomes/models/er-outcome.model').ErOutcome | null;
  tasks?: import('../../tasks/models/er-task.model').ErTask[];
}
