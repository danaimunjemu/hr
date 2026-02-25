import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveRequest } from '../models/leave-request.model';

@Injectable({
    providedIn: 'root'
})
export class LeaveManagementRequestService {
    private readonly apiUrl = 'http://localhost:8090/api/leave-requests';

    constructor(private http: HttpClient) { }

    getAll(): Observable<LeaveRequest[]> {
        return this.http.get<LeaveRequest[]>(this.apiUrl);
    }

    getById(id: number): Observable<LeaveRequest> {
        return this.http.get<LeaveRequest>(`${this.apiUrl}/${id}`);
    }

    create(request: Partial<LeaveRequest>): Observable<LeaveRequest> {
        return this.http.post<LeaveRequest>(this.apiUrl, request);
    }

    submit(id: number): Observable<LeaveRequest> {
        return this.http.post<LeaveRequest>(`${this.apiUrl}/${id}/submit`, {});
    }

    approve(id: number, comments?: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/approve`, { comments });
    }

    reject(id: number, comments: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/reject`, { comments });
    }

    lineManagerApprove(id: number, comments?: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/line-manager/approve`, { comments });
    }

    lineManagerReject(id: number, comments: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/line-manager/reject`, { comments });
    }

    hrApprove(id: number, comments?: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/hr/approve`, { comments });
    }

    hrReject(id: number, comments: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/hr/reject`, { comments });
    }

    getHrPendingQueue(): Observable<LeaveRequest[]> {
        return this.http.get<LeaveRequest[]>(`${this.apiUrl}/hr/pending`);
    }

    bulkApproveLowRisk(requestIds: number[], comments?: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/hr/bulk-approve-low-risk`, { requestIds, comments });
    }

    getReversalImpact(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}/reversal-impact`);
    }

    reverse(id: number, comments: string, acknowledgeClosedCycle: boolean = false): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/reverse`, { comments, acknowledgeClosedCycle });
    }
}
