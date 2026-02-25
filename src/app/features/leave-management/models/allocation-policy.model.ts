import { Employee } from '../../employees/models/employee.model';

export type AllocationTriggerType = 'ONBOARDING' | 'TENURE' | 'ANNUAL' | 'MANUAL' | 'MIGRATION';
export type AllocationMode = 'FIXED_DAYS' | 'MULTIPLIER_OF_DEFAULT_ENTITLEMENT' | 'REPLACE_ENTITLEMENT' | 'BALANCE_ADJUSTMENT' | 'SET_ELIGIBILITY';
export type ProrationMode = 'NONE' | 'BY_MONTHS_REMAINING_IN_YEAR' | 'BY_DAYS_REMAINING_IN_YEAR';

export interface LeaveAllocationPolicy {
    id?: number;
    name: string;
    triggerType: AllocationTriggerType;
    allocationMode: AllocationMode;
    prorationMode: ProrationMode;
    allocationValue: number;
    effectiveFrom: string;
    effectiveTo?: string;
    runMonth?: number;
    runDayOfMonth?: number;
    cycleType?: string;
    cycleStartMonth?: number;
    cycleStartDay?: number;
    companyTimezone?: string;
    priority: number;
    stackable: boolean;
    oneTime: boolean;
    active: boolean;
    // Filters
    company?: any;
    organizationalUnit?: any;
    employeeGroup?: any;
    employeeSubGroup?: any;
    grade?: any;
    position?: any;
    employmentType?: any;
    leaveComplianceType?: string;
    minServiceMonths?: number;
    maxServiceMonths?: number;
}

export interface LeaveAllocationRun {
    id?: number;
    triggerType: AllocationTriggerType;
    runType: 'SCHEDULED' | 'MANUAL';
    status: string;
    processedCount: number;
    successCount: number;
    failedCount: number;
    skippedCount: number;
    startedAt: string;
    completedAt?: string;
}
