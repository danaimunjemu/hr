export interface Payslip {
    id: string;
    employeeId: number;
    period: string;
    generatedAt: string;
    templateVersion: string;
    grossBasic: number;
    grossOvertime: number;
    paye: number;
    leavePayableAmount: number;
    netPay: number;
}
