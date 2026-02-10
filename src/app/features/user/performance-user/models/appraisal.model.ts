import { PerformanceCycle } from '../../../performance/models/performance-cycle.model';

export interface Employee {
  id: number;
  firstName?: string;
  lastName?: string;
  employeeNumber?: string;
}

export interface GoalItem {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string | null;
  description: string;
  weight: number;
  measurement: string;
  dueDate: string;
  goalSetting?: any | null;
}

export interface AppraisalItem {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string | null;
  appraisal?: any | null;
  goalItem: GoalItem;
  selfRating: number | null;
  selfComment: string | null;
  managerRating: number | null;
  managerComment: string | null;
}

export interface Appraisal {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string | null;
  employee: Employee;
  manager: Employee;
  cycle: PerformanceCycle;
  goalSetting: any;
  status: string;
  finalScore: number | null;
  appraisalItems: AppraisalItem[];
}

export interface SelfRateRequest {
  appraisalItemId: number;
  rating: number;
  comment: string;
}
