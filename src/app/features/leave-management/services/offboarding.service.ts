import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveOffboardingPayoutRun } from '../models/offboarding-payout.model';

@Injectable({
    providedIn: 'root'
})
export class LeaveManagementOffboardingService {
    private readonly terminationUrl = 'http://localhost:8090/api/employee-terminations';
    private readonly policyUrl = 'http://localhost:8090/api/leave-offboarding-payout-policies';
    private readonly payoutUrl = 'http://localhost:8090/api/leave-offboarding-payouts';

    constructor(private http: HttpClient) { }

    getPayoutRuns(): Observable<LeaveOffboardingPayoutRun[]> {
        return this.http.get<LeaveOffboardingPayoutRun[]>(this.payoutUrl);
    }

    finalizePayout(id: number): Observable<any> {
        return this.http.post<any>(`${this.payoutUrl}/${id}/finalize`, {});
    }

    getTerminations(): Observable<any[]> {
        return this.http.get<any[]>(this.terminationUrl);
    }

    getPolicies(): Observable<any[]> {
        return this.http.get<any[]>(this.policyUrl);
    }
}
