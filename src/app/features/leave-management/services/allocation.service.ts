import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveAllocationPolicy, LeaveAllocationRun } from '../models/allocation-policy.model';

@Injectable({
    providedIn: 'root'
})
export class LeaveManagementAllocationService {
    private readonly policyUrl = 'http://localhost:8090/api/leave-allocation-policies';
    private readonly runUrl = 'http://localhost:8090/api/leave-allocation-runs';

    constructor(private http: HttpClient) { }

    // Policies
    getPolicies(): Observable<LeaveAllocationPolicy[]> {
        return this.http.get<LeaveAllocationPolicy[]>(this.policyUrl);
    }

    executeRun(data: any): Observable<any> {
        return this.http.post<any>(this.runUrl, data);
    }

    createPolicy(policy: LeaveAllocationPolicy): Observable<LeaveAllocationPolicy> {
        return this.http.post<LeaveAllocationPolicy>(this.policyUrl, policy);
    }

    updatePolicy(id: number, policy: LeaveAllocationPolicy): Observable<LeaveAllocationPolicy> {
        return this.http.put<LeaveAllocationPolicy>(`${this.policyUrl}/${id}`, policy);
    }

    // Runs
    executeAllocation(payload: any): Observable<LeaveAllocationRun> {
        return this.http.post<LeaveAllocationRun>(`${this.runUrl}/execute`, payload);
    }

    bootstrapMigration(payload: any): Observable<LeaveAllocationRun> {
        return this.http.post<LeaveAllocationRun>(`${this.runUrl}/bootstrap`, payload);
    }

    executeOnboarding(employeeId: number): Observable<LeaveAllocationRun> {
        return this.http.post<LeaveAllocationRun>(`${this.runUrl}/execute/onboarding/${employeeId}`, {});
    }

    getRunEvents(runId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.runUrl}/${runId}/events`);
    }
}
