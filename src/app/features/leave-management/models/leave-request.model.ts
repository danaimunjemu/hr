import { Employee } from '../../employees/models/employee.model';
import { LeaveType } from './leave-type.model';

export type LeaveRequestStatus = 'DRAFT' | 'SUBMITTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'WITHDRAWN';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type RiskClassification = 'LOW' | 'MEDIUM' | 'HIGH';

export interface LeaveRequest {
    id?: number;
    employee: Employee;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    startDayPortion: string; // e.g., 'FULL', 'MORNING', 'AFTERNOON'
    endDayPortion: string;
    totalDays: number;
    status: LeaveRequestStatus;
    lineManagerApprovalStatus: ApprovalStatus;
    hrApprovalStatus: ApprovalStatus;
    riskClassification: RiskClassification;
    anomalyIndicators?: string;
    cycleCode: string;
    cycleStartDate: string;
    cycleEndDate: string;
    reversedBy?: string;
    reversedDate?: string;
    reversalComments?: string;
    documentPath?: string;
    createdOn?: string;
    updatedOn?: string;
}
