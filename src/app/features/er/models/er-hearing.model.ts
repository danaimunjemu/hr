import { ErCaseDto, ErCaseTaskDto } from '../process/models/er-process.model';

export interface ErHearingView {
    id: number;
    caseId: number;
    caseNumber: string;
    employeeName: string;
    title: string;
    date: string;
    status: 'OPEN' | 'DONE';
    isOverdue: boolean;
}

export function extractHearingsFromCase(erCase: ErCaseDto): ErHearingView[] {
    if (!erCase.tasks || !erCase.id) return [];

    return erCase.tasks
        .filter(t => t.taskType === 'HEARING')
        .map(t => ({
            id: t.id || 0,
            caseId: erCase.id!,
            caseNumber: erCase.caseNumber || 'N/A',
            employeeName: `${erCase.subjectEmployee.firstName || ''} ${erCase.subjectEmployee.lastName || ''}`.trim(),
            title: t.title,
            date: t.dueAt,
            status: t.status || 'OPEN',
            isOverdue: t.status === 'OPEN' && new Date(t.dueAt) < new Date()
        }));
}
