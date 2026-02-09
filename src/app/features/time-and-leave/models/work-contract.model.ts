export interface WorkContract {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  name: string;
  normalHoursPerDay: number;
  normalHoursPerWeek: number;
  overtimeDailyThreshold: number;
  overtimeWeeklyThreshold: number;
  overtimePolicy: 'DAILY' | 'WEEKLY' | 'BOTH';
  roundingMinutes: number;
}
