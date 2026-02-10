import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GoalSetting, GoalSettingAssignmentRequest } from '../models/goal-setting.model';

@Injectable({
  providedIn: 'root'
})
export class GoalSettingService {
  private readonly apiUrl = 'http://localhost:8090/api/performance-goal-setting';

  constructor(private http: HttpClient) {}

  assignGoalSetting(templateId: number, request: GoalSettingAssignmentRequest): Observable<GoalSetting[]> {
    return this.http.post<GoalSetting[]>(`${this.apiUrl}/${templateId}/assign`, request);
  }

  getAll(): Observable<GoalSetting[]> {
    return this.http.get<GoalSetting[]>(this.apiUrl);
  }

  getById(id: number): Observable<GoalSetting> {
    return this.http.get<GoalSetting>(`${this.apiUrl}/${id}`);
  }
}
