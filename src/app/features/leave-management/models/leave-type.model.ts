export type LeaveComplianceType = 'STATUTORY' | 'NON_STATUTORY';

export interface LeaveType {
    id?: number;
    name: string;
    leaveComplianceType: LeaveComplianceType;
    defaultDaysPerYear: number;
    requiresDocumentation: boolean;
    maxConsecutiveDays?: number;
    minNoticeDays?: number;
    allowNegativeBalance: boolean;
    carryOverAllowed: boolean;
    maxCarryOverDays?: number;
    category?: string;
    createdOn?: string;
    updatedOn?: string;
}
