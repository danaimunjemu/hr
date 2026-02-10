import { PerformanceCycle } from './performance-cycle.model';

export interface PerformanceGoalTemplate {
  id?: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  name: string;
  cycle: PerformanceCycle;
  locked: boolean;
}
