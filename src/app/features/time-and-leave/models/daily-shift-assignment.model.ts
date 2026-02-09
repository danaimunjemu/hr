import { ShiftDefinition } from './shift-definition.model';

export interface DailyShiftAssignment {
  id: number;
  employeeId: number;
  date: string;
  shiftDefinition: ShiftDefinition;
}
