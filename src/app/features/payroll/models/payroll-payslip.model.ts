export interface PayrollLineItem {
    id: number;
    componentCode: string;
    componentName: string;
    componentType: 'EARNING' | 'DEDUCTION' | 'EMPLOYER_CONTRIBUTION';
    earningSubtype?: string;
    amount: number;
    taxable: boolean;
    quantity: number;
    rate: number;
    netEffectAmount: number;
    traceNote: string;
}

export interface LeaveBalanceInfo {
    openingBalanceDays: number;
    accruedDays: number;
    takenDays: number;
    closingBalanceDays: number;
}

export interface PayrollPayslip {
    id: number;
    employeeId: number;
    employeeNumber: string;
    grossAmount: number;
    taxableAmount: number;
    deductionsAmount: number;
    netAmount: number;
    employerCostAmount: number;
    leaveBalanceInfo: LeaveBalanceInfo;
    lineItems: PayrollLineItem[];

    // UI Metadata (may be populated manually or available in full response)
    employeeName?: string;
    designation?: string;
    department?: string;
    period?: string;
    generatedAt?: string;
    companyName?: string;
    companyAddress?: string;
}
