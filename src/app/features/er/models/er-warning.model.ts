import { ErCaseDto } from '../process/models/er-process.model';
import { calculateWarningExpiry, isWarningExpired, getDaysRemaining } from '../utils/warning-validity.util';

export interface ErWarningView {
    caseId: number;
    caseNumber: string;
    employeeName: string;
    type: string;
    issueDate: string;
    expiryDate: Date;
    isExpired: boolean;
    daysRemaining: number;
    summary: string;
    documents: any[];
}

export function mapCaseToWarningView(erCase: ErCaseDto): ErWarningView | null {
    if (!erCase.outcome || !erCase.id || !erCase.subjectEmployee) return null;

    const outcome = erCase.outcome;
    const expiryDate = calculateWarningExpiry(outcome.decisionAt, outcome.outcomeType);

    return {
        caseId: erCase.id,
        caseNumber: erCase.caseNumber || 'N/A',
        employeeName: `${erCase.subjectEmployee.firstName || ''} ${erCase.subjectEmployee.lastName || ''}`.trim(),
        type: outcome.outcomeType,
        issueDate: outcome.decisionAt,
        expiryDate: expiryDate,
        isExpired: isWarningExpired(expiryDate),
        daysRemaining: getDaysRemaining(expiryDate),
        summary: outcome.decisionSummary,
        documents: []
    };
}
