import { CaseRef, EmployeeRef } from '../../intakes/models/er-intake.model';

export type OutcomeType = 'WRITTEN_WARNING' | 'VERBAL_WARNING' | 'DISMISSAL' | 'SUSPENSION' | 'EXONERATED' | 'OTHER';

export interface ErOutcome {
  id: number;
  erCase: CaseRef;
  outcomeType: OutcomeType;
  decisionSummary: string;
  actionTaken: string;
  decisionAt: string;
  decidedBy: EmployeeRef;
  communicatedAt?: string;
  communicationNotes?: string;
}
