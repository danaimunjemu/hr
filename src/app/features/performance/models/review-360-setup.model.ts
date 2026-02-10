import { PerformanceCycle } from './performance-cycle.model';
import { Employee } from './employee.model';

export interface Review360Setup {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string | null;
  employee: Employee;
  cycle: PerformanceCycle;
  startDate: string;
  endDate: string;
  anonymous: boolean;
  status: string;
  reviewers: Employee[];
}
