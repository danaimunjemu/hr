export interface OvertimeRule {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  ruleCode: string;
  ruleName: string;
  description: string;
  overtimeType: string;
  multiplier: number;
  startTime: string;
  endTime: string;
  appliesToWeekdays: boolean;
  appliesToSaturdays: boolean;
  appliesToSundays: boolean;
  appliesToPublicHolidays: boolean;
  organizationalUnit: {
    id: number;
    name: string;
  };
  effectiveFrom: string;
  effectiveTo: string;
  active: boolean;
  priority: number;
}
