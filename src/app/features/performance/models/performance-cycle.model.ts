export interface PerformanceCycle {
  id?: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  name: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
  active: boolean;
}
