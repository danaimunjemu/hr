import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ErProcessService } from '../process/services/er-process.service';
import { ErCaseDto, ErCaseTaskDto } from '../process/models/er-process.model';

@Injectable({
    providedIn: 'root'
})
export class ErCaseService {
    constructor(private erProcess: ErProcessService) { }

    getCases(params?: any): Observable<ErCaseDto[]> {
        return this.erProcess.getAllCases(params);
    }

    getCaseById(id: number): Observable<ErCaseDto> {
        // Assuming backend has GET /cases/{id} though not explicitly in prompt,
        // we can filter from all cases if needed or assume standard REST.
        // Based on prompt, we'll use a filtered approach if specific endpoint is missing.
        return this.erProcess.getAllCases({ id }).pipe(
            map(cases => cases[0])
        );
    }

    getDisciplinaryCases(filters?: any): Observable<ErCaseDto[]> {
        return this.erProcess.getAllCases({ ...filters, caseType: 'DISCIPLINARY' });
    }

    getEmployeeDisciplinaryCases(employeeId: number): Observable<ErCaseDto[]> {
        return this.erProcess.getAllCases({ employeeId, caseType: 'DISCIPLINARY' });
    }

    createHearingTask(caseId: number, title: string, dueAt: string): Observable<ErCaseTaskDto> {
        return this.erProcess.addTask(caseId, {
            title,
            description: 'Scheduled disciplinary hearing',
            taskType: 'HEARING',
            assignedTo: { id: 0 }, // Placeholder, usually current user or specific role
            dueAt
        });
    }
}
