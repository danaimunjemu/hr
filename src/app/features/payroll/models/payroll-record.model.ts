export interface PayrollRecord {
    id: string;
    employeeId: number;
    employeeName: string;
    company: string;
    department: string;
    role: string;
    grossBasic: number;
    overtimeHours: number;
    grossOvertime: number;
    paye: number;
    leaveDaysTaken: number;
    leavePayableAmount: number;
    period: string; // e.g. "2026-02"
}
