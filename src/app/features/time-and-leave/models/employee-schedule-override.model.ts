import { Employee } from '../../employees/models/employee.model';
import { ShiftDefinition } from './shift-definition.model';
import { RotationType, RotationShift } from './group-schedule-rule.model';

export interface EmployeeScheduleOverride {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  employee: Employee;
  shiftDefinition?: ShiftDefinition; // For FIXED
  rotationType: RotationType;
  effectiveFrom: string;
  cycleOnWeeks: number;
  cycleOffWeeks: number;
  cycleStartDate: string;
  rotationShifts?: RotationShift[]; // For ROTATING
}
