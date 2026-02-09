export interface OvertimeRule {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  name: string;
  rateMultiplier: number;
  conditionType: 'DAILY_EXCESS' | 'WEEKLY_EXCESS' | 'WEEKEND' | 'HOLIDAY' | 'REST_DAY';
  thresholdMinutes?: number; // For daily/weekly excess
  priority: number;
}
