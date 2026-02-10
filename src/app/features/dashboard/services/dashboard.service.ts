import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { DashboardData, OhsMetrics, ErMetrics, TimeLeaveMetrics, WorkforceMetrics } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_BASE = 'http://localhost:8090/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardData> {
    // We use forkJoin to fetch all sections in parallel
    // In a real scenario, this might be a single aggregated endpoint or separate calls
    // Here we simulate separate calls as requested by "structured data from backend"
    
    return forkJoin({
      ohs: this.getOhsMetrics(),
      er: this.getErMetrics(),
      timeLeave: this.getTimeLeaveMetrics(),
      workforce: this.getWorkforceMetrics()
    });
  }

  private getOhsMetrics(): Observable<OhsMetrics> {
    return this.http.get<OhsMetrics>(`${this.API_BASE}/ohs`).pipe(
      catchError(error => {
        console.error('Failed to load OHS metrics', error);
        // Return partial/empty structure or throw based on error handling policy
        // For dashboard resilience, we return an empty structure to prevent full crash
        return of(this.getEmptyOhsMetrics());
      })
    );
  }

  private getErMetrics(): Observable<ErMetrics> {
    return this.http.get<ErMetrics>(`${this.API_BASE}/er`).pipe(
      catchError(error => {
        console.error('Failed to load ER metrics', error);
        return of(this.getEmptyErMetrics());
      })
    );
  }

  private getTimeLeaveMetrics(): Observable<TimeLeaveMetrics> {
    return this.http.get<TimeLeaveMetrics>(`${this.API_BASE}/time-leave`).pipe(
      catchError(error => {
        console.error('Failed to load Time & Leave metrics', error);
        return of(this.getEmptyTimeLeaveMetrics());
      })
    );
  }

  private getWorkforceMetrics(): Observable<WorkforceMetrics> {
    return this.http.get<WorkforceMetrics>(`${this.API_BASE}/workforce`).pipe(
      catchError(error => {
        console.error('Failed to load Workforce metrics', error);
        return of(this.getEmptyWorkforceMetrics());
      })
    );
  }

  // --- Empty Fallback Generators ---

  private getEmptyOhsMetrics(): OhsMetrics {
    return {
      kpis: {
        safetyIncidents: { label: 'Safety Incidents', value: 0, severity: 'neutral' },
        openInvestigations: { label: 'Open Investigations', value: 0, severity: 'neutral' },
        highSeverityIncidents: { label: 'High Severity', value: 0, severity: 'neutral' },
        daysLost: { label: 'Days Lost', value: 0, severity: 'neutral' },
        nearMisses: { label: 'Near Misses', value: 0, severity: 'neutral' },
        medicalSurveillanceDue: { label: 'Medical Due', value: 0, severity: 'neutral' },
        unfitEmployees: { label: 'Unfit Employees', value: 0, severity: 'neutral' },
        correctiveActionsPending: { label: 'Actions Pending', value: 0, severity: 'neutral' }
      },
      charts: {
        incidentsByType: [],
        incidentTrend: [],
        investigationStatus: [],
        nearMissSeverity: []
      }
    };
  }

  private getEmptyErMetrics(): ErMetrics {
    return {
      kpis: {
        activeCases: { label: 'Active Cases', value: 0, severity: 'neutral' },
        casesAtRisk: { label: 'Cases At Risk', value: 0, severity: 'neutral' },
        openTasks: { label: 'Open Tasks', value: 0, severity: 'neutral' },
        overdueTasks: { label: 'Overdue Tasks', value: 0, severity: 'neutral' }
      },
      charts: {
        casesByStage: [],
        caseVolumeByDept: [],
        casePriority: [],
        tasksByAssignee: []
      }
    };
  }

  private getEmptyTimeLeaveMetrics(): TimeLeaveMetrics {
    return {
      kpis: {
        pendingLeaveRequests: { label: 'Pending Leave', value: 0, severity: 'neutral' },
        employeesOnLeave: { label: 'On Leave', value: 0, severity: 'neutral' },
        pendingTimesheets: { label: 'Pending Timesheets', value: 0, severity: 'neutral' },
        totalOvertimeHours: { label: 'Overtime Hours', value: 0, severity: 'neutral' }
      },
      charts: {
        leaveTypeDistribution: [],
        overtimeTrend: [],
        leaveStatusOverview: []
      }
    };
  }

  private getEmptyWorkforceMetrics(): WorkforceMetrics {
    return {
      kpis: {
        totalHeadcount: { label: 'Headcount', value: 0, severity: 'neutral' },
        newHires: { label: 'New Hires', value: 0, severity: 'neutral' },
        terminations: { label: 'Terminations', value: 0, severity: 'neutral' },
        genderDiversity: { label: 'Diversity Ratio', value: 0, severity: 'neutral' }
      },
      charts: {
        headcountByDept: [],
        employmentTypeSplit: [],
        tenureDistribution: []
      }
    };
  }
}
