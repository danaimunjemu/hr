import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GroupScheduleRule } from '../models/group-schedule-rule.model';

@Injectable({
  providedIn: 'root'
})
export class GroupScheduleRuleService {
  private readonly apiUrl = 'http://localhost:8090/api/group-schedule-rules';

  constructor(private http: HttpClient) {}

  getAll(): Observable<GroupScheduleRule[]> {
    return this.http.get<GroupScheduleRule[]>(this.apiUrl);
  }

  getById(id: number): Observable<GroupScheduleRule> {
    return this.http.get<GroupScheduleRule>(`${this.apiUrl}/${id}`);
  }

  create(rule: GroupScheduleRule): Observable<GroupScheduleRule> {
    return this.http.post<GroupScheduleRule>(this.apiUrl, rule);
  }

  update(id: number, rule: GroupScheduleRule): Observable<GroupScheduleRule> {
    return this.http.put<GroupScheduleRule>(`${this.apiUrl}/${id}`, rule);
  }
}
