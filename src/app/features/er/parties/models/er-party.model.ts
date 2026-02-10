import { CaseRef, EmployeeRef } from '../../intakes/models/er-intake.model';

export type PartyRole = 'WITNESS' | 'COMPLAINANT' | 'RESPONDENT' | 'INVESTIGATOR' | 'REPRESENTATIVE';
export type PersonType = 'EMPLOYEE' | 'EXTERNAL';

export interface ErParty {
  id: number;
  erCase: CaseRef;
  role: PartyRole;
  personType: PersonType;
  employee?: EmployeeRef;
  externalName?: string; // Implied field for EXTERNAL type based on requirement "employee/external name"
  notes?: string;
}
