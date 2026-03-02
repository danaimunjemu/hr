import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ErCaseService } from './er-case.service';
import { ErCaseDto } from '../process/models/er-process.model';

export interface DisciplinaryDashboard {
    totalCases: number;
    openCases: number;
    closedCases: number;
    activeWarnings: number;
    outcomesByType: Record<string, number>;
    departmentalAffected: { name: string; count: number }[];
    monthlyTrends: { month: string; opened: number; closed: number }[];
}

@Injectable({
    providedIn: 'root'
})
export class ErAnalyticsService {
    constructor(private erCaseService: ErCaseService) { }

    getDisciplinaryAnalytics(): Observable<DisciplinaryDashboard> {
        return this.erCaseService.getDisciplinaryCases().pipe(
            map(cases => this.aggregateData(cases))
        );
    }

    private aggregateData(cases: ErCaseDto[]): DisciplinaryDashboard {
        const dashboard: DisciplinaryDashboard = {
            totalCases: cases.length,
            openCases: cases.filter(c => c.status !== 'CLOSED').length,
            closedCases: cases.filter(c => c.status === 'CLOSED').length,
            activeWarnings: 0, // Will be computed
            outcomesByType: {},
            departmentalAffected: [],
            monthlyTrends: []
        };

        const deptMap: Record<string, number> = {};
        const monthMap: Record<string, { opened: number; closed: number }> = {};

        cases.forEach(c => {
            // Outcome aggregation
            if (c.outcome) {
                const type = c.outcome.outcomeType;
                dashboard.outcomesByType[type] = (dashboard.outcomesByType[type] || 0) + 1;

                // Active warnings check (simplified check for aggregation)
                if (['FORMAL_WARNING', 'FINAL_WARNING', 'WRITTEN_WARNING'].includes(type)) {
                    // We'd ideally check expiry here too
                    dashboard.activeWarnings++;
                }
            }

            // Department aggregation
            const dept = (c.subjectEmployee as any).department?.name || 'Unknown';
            deptMap[dept] = (deptMap[dept] || 0) + 1;

            // Monthly trends
            if (c.createdAt) {
                const month = new Date(c.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
                if (!monthMap[month]) monthMap[month] = { opened: 0, closed: 0 };
                monthMap[month].opened++;
                if (c.status === 'CLOSED') monthMap[month].closed++;
            }
        });

        dashboard.departmentalAffected = Object.entries(deptMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        dashboard.monthlyTrends = Object.entries(monthMap)
            .map(([month, data]) => ({ month, ...data }));

        return dashboard;
    }
}
