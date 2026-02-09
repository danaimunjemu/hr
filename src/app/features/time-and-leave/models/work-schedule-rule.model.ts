import { WeekendRule } from './weekend-rule.model';

export interface WorkScheduleRule {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  name: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  breakMinutes: number;
  paidHours: number;
  nightShift: boolean;
  weekendShift: boolean;
  weekendRule: WeekendRule;
}
