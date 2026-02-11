import { PerformanceCycle } from './performance-cycle.model';
import { PerformanceGoalTemplateItem } from './performance-goal-template-item.model';

export interface PerformanceGoalTemplate {
  id?: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  name: string;
  cycle: PerformanceCycle;
  locked: boolean;
  items?: PerformanceGoalTemplateItem[];
}
