import { EmployeeGroup } from './employee-group.model';
import { ShiftDefinition } from './shift-definition.model';

export type RotationType = 'FIXED' | 'ROTATING';

export interface RotationShift {
  id?: number;
  shiftDefinition: ShiftDefinition;
  sequence: number;
}

export interface GroupScheduleRule {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  employeeGroup: EmployeeGroup;
  shiftDefinition?: ShiftDefinition; // For FIXED
  rotationType: RotationType;
  effectiveFrom: string;
  cycleOnWeeks: number;
  cycleOffWeeks: number;
  cycleStartDate: string;
  rotationShifts?: RotationShift[]; // For ROTATING
}
