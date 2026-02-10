import { CaseType, Confidentiality } from '../../cases/models/er-case.model';

export interface ErTemplate {
  id: number;
  name: string;
  caseType: CaseType;
  version: number;
  active: boolean;
  description?: string;
  defaultConfidentiality?: Confidentiality;
}
