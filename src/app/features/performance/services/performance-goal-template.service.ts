import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerformanceGoalTemplate } from '../models/performance-goal-template.model';

@Injectable({
  providedIn: 'root'
})
export class PerformanceGoalTemplateService {
  private readonly apiUrl = 'http://localhost:8090/api/performance-goal-template';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PerformanceGoalTemplate[]> {
    return this.http.get<PerformanceGoalTemplate[]>(`${this.apiUrl}/with-items`);
  }

  getById(id: number): Observable<PerformanceGoalTemplate> {
    return this.http.get<PerformanceGoalTemplate>(`${this.apiUrl}/${id}`);
  }

  create(template: PerformanceGoalTemplate): Observable<PerformanceGoalTemplate> {
    return this.http.post<PerformanceGoalTemplate>(`${this.apiUrl}/add-goal-template`, template);
  }

  update(id: number, template: PerformanceGoalTemplate): Observable<PerformanceGoalTemplate> {
    return this.http.put<PerformanceGoalTemplate>(`${this.apiUrl}/${id}`, template);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
