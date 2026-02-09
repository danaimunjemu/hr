import { Employee } from '../../employees/models/employee.model';
import { EmployeeGroup } from './employee-group.model';
import { ShiftDefinition } from './shift-definition.model';

export interface ScheduleException {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  employee?: Employee;
  employeeGroup?: EmployeeGroup;
  exceptionDate: string;
  offDay: boolean;
  shiftDefinition?: ShiftDefinition;
}
