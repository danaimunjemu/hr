export interface EmployeeRef {
  id: number;
  firstName?: string;
  lastName?: string;
}

export interface CaseRef {
  id: number;
  caseNumber?: string;
  title?: string;
}

export type TriageDecision = 'PROCEED' | 'DISMISS' | 'INVESTIGATE' | 'MEDIATE';

export interface ErIntake {
  id: number;
  erCase: CaseRef;
  incidentDateFrom: string;
  incidentDateTo?: string;
  incidentLocation: string;
  detailedDescription: string;
  triageDecision?: TriageDecision;
  triageNotes?: string;
  loggedBy: EmployeeRef;
}
