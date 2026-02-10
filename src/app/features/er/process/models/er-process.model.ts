import { EmployeeRef, CaseRef } from '../../intakes/models/er-intake.model';

export interface ErCaseDto {
  caseType: string;
  priority: string;
  title: string;
  summary: string;
  subjectEmployee: { id: number };
  reporterEmployee: { id: number };
  company: { id: number };
}

export interface ErAssignCaseRequestDto {
  assignedToUser: { id: number };
  notes: string;
}

export interface ErCaseIntakeDto {
  incidentDateFrom: string;
  incidentLocation: string;
  detailedDescription: string;
}

export interface ErCaseOutcomeDto {
  outcomeType: string;
  decisionSummary: string;
  decidedBy: { id: number };
  decisionAt: string;
}

export interface ErTaskNotes {
  notes: string;
}

export interface ErCaseTaskDto {
  title: string;
  description: string;
  taskType: string;
  assignedTo: { id: number };
  dueAt: string;
}

export interface ErCasePartyDto {
  role: string;
  personType: string;
  employee: { id: number };
}

export interface ErCaseTaskDocumentDto {
  document: { id: string };
  visibility: string;
  notes: string;
}

export interface ErCaseIntakeDocumentDto {
  document: { id: string };
  visibility: string;
  notes: string;
}

export interface ErCaseOutcomeDocumentDto {
  document: { id: string };
  visibility: string;
  notes: string;
}
