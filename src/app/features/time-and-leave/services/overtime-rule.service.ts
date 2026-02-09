import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OvertimeRule } from '../models/overtime-rule.model';

@Injectable({
  providedIn: 'root'
})
export class OvertimeRuleService {
  private readonly apiUrl = 'http://localhost:8090/api/overtime-rules';

  constructor(private http: HttpClient) {}

  getAll(): Observable<OvertimeRule[]> {
    return this.http.get<OvertimeRule[]>(this.apiUrl);
  }

  getById(id: number): Observable<OvertimeRule> {
    return this.http.get<OvertimeRule>(`${this.apiUrl}/${id}`);
  }

  create(rule: OvertimeRule): Observable<OvertimeRule> {
    return this.http.post<OvertimeRule>(this.apiUrl, rule);
  }

  update(id: number, rule: OvertimeRule): Observable<OvertimeRule> {
    return this.http.put<OvertimeRule>(`${this.apiUrl}/${id}`, rule);
  }
}
