import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkScheduleRule } from '../models/work-schedule-rule.model';

@Injectable({
  providedIn: 'root'
})
export class WorkScheduleRuleService {
  private readonly apiUrl = 'http://localhost:8090/api/work-schedule-rule';

  constructor(private http: HttpClient) {}

  getAll(): Observable<WorkScheduleRule[]> {
    return this.http.get<WorkScheduleRule[]>(this.apiUrl);
  }

  getById(id: number): Observable<WorkScheduleRule> {
    return this.http.get<WorkScheduleRule>(`${this.apiUrl}/${id}`);
  }

  create(rule: WorkScheduleRule): Observable<WorkScheduleRule> {
    return this.http.post<WorkScheduleRule>(this.apiUrl, rule);
  }

  update(id: number, rule: WorkScheduleRule): Observable<WorkScheduleRule> {
    return this.http.put<WorkScheduleRule>(`${this.apiUrl}/${id}`, rule);
  }
}
