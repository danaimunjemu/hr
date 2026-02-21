import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobVacancy, ApprovalStatus, ApprovalRequestPayload, JobVacancyStatus } from '../models/job-vacancy.model';

@Injectable({
    providedIn: 'root'
})
export class JobVacancyService {
    private readonly apiUrl = 'http://localhost:8090/api/job-vacancies';

    constructor(private http: HttpClient) { }

    // 🔹 CRUD Operations
    getAll(): Observable<JobVacancy[]> {
        return this.http.get<JobVacancy[]>(this.apiUrl);
    }

    getById(id: string): Observable<JobVacancy> {
        return this.http.get<JobVacancy>(`${this.apiUrl}/${id}`);
    }

    create(data: Partial<JobVacancy>): Observable<JobVacancy> {
        return this.http.post<JobVacancy>(this.apiUrl, data);
    }

    update(id: string, data: Partial<JobVacancy>): Observable<JobVacancy> {
        return this.http.put<JobVacancy>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // 🔹 Workflow Actions
    override(id: string): Observable<JobVacancy> {
        return this.http.put<JobVacancy>(`${this.apiUrl}/requests/${id}/override`, {});
    }

    changeHeadOfDepartment(id: string, hodId: string): Observable<JobVacancy> {
        return this.http.put<JobVacancy>(`${this.apiUrl}/requests/${id}/head-of-department`, { hodId });
    }

    fulfill(id: string): Observable<JobVacancy> {
        return this.http.post<JobVacancy>(`${this.apiUrl}/requests/${id}/fulfill`, {});
    }

    approveHr(id: string, payload: ApprovalRequestPayload): Observable<JobVacancy> {
        return this.http.post<JobVacancy>(`${this.apiUrl}/requests/${id}/approvals/hr`, payload);
    }

    approveHod(id: string, payload: ApprovalRequestPayload): Observable<JobVacancy> {
        return this.http.post<JobVacancy>(`${this.apiUrl}/requests/${id}/approvals/hod`, payload);
    }

    // 🔹 Request Query Endpoints
    getRequests(): Observable<JobVacancy[]> {
        return this.http.get<JobVacancy[]>(`${this.apiUrl}/requests`);
    }

    getRequestsByStatus(status: JobVacancyStatus): Observable<JobVacancy[]> {
        return this.http.get<JobVacancy[]>(`${this.apiUrl}/requests/by-status`, { params: { status } });
    }

    getRequestsByStatusAndOu(status: JobVacancyStatus, ouId: string): Observable<JobVacancy[]> {
        return this.http.get<JobVacancy[]>(`${this.apiUrl}/requests/by-status-and-ou`, { params: { status, ouId } });
    }

    getRequestsByOu(ouId: string): Observable<JobVacancy[]> {
        return this.http.get<JobVacancy[]>(`${this.apiUrl}/requests/by-ou`, { params: { ouId } });
    }

    getRequestsByHrApproval(status: ApprovalStatus): Observable<JobVacancy[]> {
        return this.http.get<JobVacancy[]>(`${this.apiUrl}/requests/by-hr-approval`, { params: { status } });
    }

    getRequestsByHrApprovalAndOu(status: ApprovalStatus, ouId: string): Observable<JobVacancy[]> {
        return this.http.get<JobVacancy[]>(`${this.apiUrl}/requests/by-hr-approval-and-ou`, { params: { status, ouId } });
    }

    getRequestsByHodApproval(status: ApprovalStatus): Observable<JobVacancy[]> {
        return this.http.get<JobVacancy[]>(`${this.apiUrl}/requests/by-hod-approval`, { params: { status } });
    }

    getRequestsByHodApprovalAndOu(status: ApprovalStatus, ouId: string): Observable<JobVacancy[]> {
        return this.http.get<JobVacancy[]>(`${this.apiUrl}/requests/by-hod-approval-and-ou`, { params: { status, ouId } });
    }

    getActiveInternal(): Observable<JobVacancy[]> {
        return this.http.get<JobVacancy[]>(`${this.apiUrl}/requests/active-internal`);
    }
}
