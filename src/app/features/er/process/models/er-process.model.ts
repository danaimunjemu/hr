import { EmployeeRef, CaseRef } from '../../intakes/models/er-intake.model';

export type ErCaseType = 'DISCIPLINARY' | 'GRIEVANCE' | 'PERFORMANCE' | 'GENERAL';
export type ErCasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ErConfidentiality = 'NORMAL' | 'CONFIDENTIAL' | 'STRICTLY_CONFIDENTIAL';
export type ErCaseStatus = 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'PENDING_DECISION' | 'CLOSED' | 'CANCELLED';
export type ErStageCode = 'INTAKE' | 'INVESTIGATION' | 'HEARING' | 'DECISION' | 'APPEAL' | 'CLOSED';
export type ErPartyRole = 'SUBJECT' | 'COMPLAINANT' | 'WITNESS' | 'INVESTIGATOR' | 'CHAIRPERSON' | 'REPRESENTATIVE';
export type ErPersonType = 'EMPLOYEE' | 'EXTERNAL_PERSON';

export interface ErCaseDto {
  id?: number;
  caseNumber?: string;
  title: string;
  summary: string;
  caseType: ErCaseType;
  priority: ErCasePriority;
  confidentiality: ErConfidentiality;
  status?: ErCaseStatus;
  currentStageCode?: ErStageCode;
  reporterType: 'EMPLOYEE' | 'EXTERNAL';
  subjectEmployee: EmployeeRef;
  reporterEmployee?: EmployeeRef;
  assignedToUser?: { id: number; firstName?: string; lastName?: string };
  createdAt?: string;
  intake?: ErCaseIntakeDto;
  outcome?: ErCaseOutcomeDto;
  tasks?: ErCaseTaskDto[];
}

export interface ErAssignCaseRequestDto {
  assignedToUser: { id: number };
  notes: string;
}

export interface ErCaseIntakeDto {
  id?: number;
  incidentDateFrom: string;
  incidentDateTo?: string;
  incidentLocation: string;
  detailedDescription: string;
  triageDecision?: string;
  triageNotes?: string;
  loggedBy?: EmployeeRef;
  createdAt?: string;
}

export interface ErCaseOutcomeDto {
  id?: number;
  outcomeType: string;
  decisionSummary: string;
  actionTaken?: string;
  decidedBy: { id: number };
  decisionAt: string;
  status?: string;
  closedAt?: string;
  closeReason?: string;
}

export interface ErTaskNotes {
  notes: string;
}

export interface ErCaseTaskDto {
  id?: number;
  title: string;
  description: string;
  taskType: string;
  assignedTo: { id: number };
  dueAt: string;
  status?: 'OPEN' | 'DONE';
  completedAt?: string;
  completionNotes?: string;
  createdAt?: string;
}

export interface ErCasePartyDto {
  id?: number;
  role: ErPartyRole;
  personType: ErPersonType;
  employee?: EmployeeRef;
  notes?: string;
}

export interface ErCaseTaskDocumentDto {
  document: { id: number };
  visibility: string;
  notes: string;
}

export interface ErCaseIntakeDocumentDto {
  document: { id: number };
  visibility: string;
  notes: string;
}

export interface ErCaseOutcomeDocumentDto {
  document: { id: number };
  visibility: string;
  notes: string;
}
