import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeekendRule } from '../models/weekend-rule.model';

@Injectable({
  providedIn: 'root'
})
export class WeekendRuleService {
  private readonly apiUrl = 'http://localhost:8090/api/weekend-rules';

  constructor(private http: HttpClient) {}

  getAll(): Observable<WeekendRule[]> {
    return this.http.get<WeekendRule[]>(this.apiUrl);
  }

  getById(id: number): Observable<WeekendRule> {
    return this.http.get<WeekendRule>(`${this.apiUrl}/${id}`);
  }

  create(rule: WeekendRule): Observable<WeekendRule> {
    return this.http.post<WeekendRule>(this.apiUrl, rule);
  }

  update(id: number, rule: WeekendRule): Observable<WeekendRule> {
    return this.http.put<WeekendRule>(`${this.apiUrl}/${id}`, rule);
  }
}
