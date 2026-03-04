import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate, InternalApplicationPayload } from '../models/candidate.model';

@Injectable({
    providedIn: 'root'
})
export class CandidateService {
    private readonly apiUrl = 'http://localhost:8090/api/candidates';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Candidate[]> {
        return this.http.get<Candidate[]>(this.apiUrl);
    }

    getById(id: string): Observable<Candidate> {
        return this.http.get<Candidate>(`${this.apiUrl}/${id}`);
    }

    create(candidate: Partial<Candidate>): Observable<Candidate> {
        return this.http.post<Candidate>(this.apiUrl, candidate);
    }

    update(id: string, candidate: Partial<Candidate>): Observable<Candidate> {
        return this.http.put<Candidate>(`${this.apiUrl}/${id}`, candidate);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    internalEmployeeApply(payload: any): Observable<Candidate> {
        return this.http.post<Candidate>(`${this.apiUrl}/internal-employee-apply`, payload);
    }

    assignJobOffer(payload: { candidateIds: number[], vacancyId: number, offeredSalary: number, offerDate: string, expiryDate: string }): Observable<any> {
        return this.http.post<any>('http://localhost:8090/api/job-offer/assign', payload);
    }
}
