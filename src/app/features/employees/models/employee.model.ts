import { WorkContract } from '../../time-and-leave/models/work-contract.model';
import { WorkScheduleRule } from '../../time-and-leave/models/work-schedule-rule.model';
import { EmployeeGroup } from '../../time-and-leave/models/employee-group.model';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeNumber?: string;
  workContract?: WorkContract;
  workScheduleRule?: WorkScheduleRule;
  group?: EmployeeGroup;
}
