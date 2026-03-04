export interface PayrollBatch {
    id: number;
    companyId: number;
    payrollYear: number;
    payrollMonth: number;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUCCESS' | 'ERROR';
    originalFileName: string;
    fileHashSha256: string;
    fileSizeBytes: number;
    uploadedByEmployeeId: number;
    uploadedAt: string;
    approvedByEmployeeId: number | null;
    approvedAt: string | null;
    approvalComment: string | null;
    rejectedByEmployeeId: number | null;
    rejectedAt: string | null;
    rejectionReason: string | null;
    totalRows: number;
    errorRows: number;
    validRows: number;
    warningsCount: number;
    errorsCount: number;
    fileErrorMessage: string | null;
    payrollRunId?: number;
}

export interface PayrollBatchItem {
    id: number;
    rowIndex: number;
    payrollNumber: string;
    employeeNumber: string;
    employeeId: number;
    valid: boolean;
    additionalData: { [key: string]: any };
    rowErrors: string[];
}

export interface PayrollDecisionRequest {
    decisionDate?: string;
    comment?: string;
    decisionBy?: string;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
