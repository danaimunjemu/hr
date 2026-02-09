import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface WorkScheduleRule {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkScheduleRulesService {
  private readonly API_URL = 'http://localhost:8090/api/work-schedule-rule';

  constructor(private http: HttpClient) {}

  getAll(): Observable<WorkScheduleRule[]> {
    return this.http.get<WorkScheduleRule[]>(this.API_URL).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch work schedule rules.')))
    );
  }

  getById(id: number): Observable<WorkScheduleRule> {
    return this.http.get<WorkScheduleRule>(`${this.API_URL}/${id}`).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch work schedule rule details.')))
    );
  }

  create(entity: Partial<WorkScheduleRule>): Observable<WorkScheduleRule> {
    return this.http.post<WorkScheduleRule>(this.API_URL, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to create work schedule rule.')))
    );
  }

  update(id: number, entity: Partial<WorkScheduleRule>): Observable<WorkScheduleRule> {
    return this.http.put<WorkScheduleRule>(`${this.API_URL}/${id}`, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to update work schedule rule.')))
    );
  }
}
