import { Employee } from '../../employees/models/employee.model';
import { LeaveType } from './leave-type.model';

export type OffboardingStatus = 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface EmployeeTermination {
    id?: number;
    employee: Employee;
    terminationDate: string;
    terminationReason: string;
    lastWorkingDate?: string;
    finalPayrollDate?: string;
    offboardingStatus: OffboardingStatus;
}

export interface LeaveOffboardingPayoutPolicy {
    id?: number;
    leaveType: LeaveType;
    terminationReason: string;
    payable: boolean;
    payoutPercentage: number;
    maxPayableDays?: number;
    active: boolean;
}

export interface LeaveOffboardingPayoutRun {
    id?: number;
    employee: Employee;
    termination: EmployeeTermination;
    status: 'DRAFT' | 'FINALIZED' | 'EXPORTED';
    totalPayoutAmount: number;
    dailyRate: number;
    notes?: string;
    finalizedAt?: string;
    exportedAt?: string;
}

export interface LeaveOffboardingPayoutItem {
    id?: number;
    payoutRunId: number;
    leaveType: LeaveType;
    cycleCode: string;
    availableDays: number;
    payableDays: number;
    payoutAmount: number;
}
