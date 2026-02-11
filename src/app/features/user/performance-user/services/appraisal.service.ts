import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appraisal, AppraisalItem, SelfRateRequest } from '../models/appraisal.model';

@Injectable({
  providedIn: 'root'
})
export class AppraisalService {
  private apiUrl = 'http://localhost:8090/api/appraisal';
  private appraisalItemUrl = 'http://localhost:8090/api/appraisal-item';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Appraisal[]> {
    return this.http.get<Appraisal[]>(`${this.apiUrl}/my-appraisals`);
  }

  getMyTeamAppraisals(): Observable<Appraisal[]> {
    return this.http.get<Appraisal[]>(`${this.apiUrl}/my-team-appraisals`);
  }

  getById(id: number): Observable<Appraisal> {
    return this.http.get<Appraisal>(`${this.apiUrl}/${id}`);
  }

  selfRate(data: SelfRateRequest): Observable<AppraisalItem> {
    return this.http.post<AppraisalItem>(`${this.appraisalItemUrl}/self-rate`, data);
  }

  managerRate(data: SelfRateRequest): Observable<AppraisalItem> {
    return this.http.post<AppraisalItem>(`${this.appraisalItemUrl}/manager-rate`, data);
  }

  submitAppraisal(id: number): Observable<Appraisal> {
    return this.http.post<Appraisal>(`${this.apiUrl}/${id}`, {});
  }

  managerSubmitAppraisal(id: number): Observable<Appraisal> {
    return this.http.post<Appraisal>(`${this.apiUrl}/managerSubmits/${id}`, {});
  }
}
