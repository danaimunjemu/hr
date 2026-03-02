import { ErCaseOutcomeDto } from '../process/models/er-process.model';

export type WarningType = 'FORMAL_WARNING' | 'FINAL_WARNING' | 'WRITTEN_WARNING' | string;

export const WARNING_POLICY_MAP: Record<string, number> = {
    'FORMAL_WARNING': 6,
    'FINAL_WARNING': 12,
    'WRITTEN_WARNING': 3
};

export function calculateWarningExpiry(decisionAt: string | Date, outcomeType: string): Date {
    const issueDate = new Date(decisionAt);
    const months = WARNING_POLICY_MAP[outcomeType] || 6; // Default to 6 months if not in map

    const expiryDate = new Date(issueDate);
    expiryDate.setMonth(expiryDate.getMonth() + months);

    return expiryDate;
}

export function isWarningExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
}

export function getDaysRemaining(expiryDate: Date): number {
    const diffTime = expiryDate.getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}
