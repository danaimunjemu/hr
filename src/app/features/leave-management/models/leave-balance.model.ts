import { Employee } from '../../employees/models/employee.model';
import { LeaveType } from './leave-type.model';

export interface LeaveBalance {
    id?: number;
    employee: Employee;
    leaveType: LeaveType;
    cycleCode: string;
    cycleStartDate: string;
    cycleEndDate: string;
    cycleClosed: boolean;
    cycleClosedAt?: string;
    openingBalance: number;
    entitlement: number;
    accrued: number;
    carryOver: number;
    adjustment: number;
    taken: number;
    pending: number;
    currentBalance: number;
    availableBalance: number;
    forfeitedAmount: number;
    adjustmentReason?: string;
    createdOn?: string;
    updatedOn?: string;
}
