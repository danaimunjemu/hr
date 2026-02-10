import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { WeekendRule } from '../models/weekend-rule.model';

@Injectable({
  providedIn: 'root'
})
export class WeekendRuleService {
  private readonly apiUrl = 'http://localhost:8090/api/weekend-rules';

  weekendRules = signal<WeekendRule[]>([]);

  constructor(private http: HttpClient) {}

  getAll(): Observable<WeekendRule[]> {
    return this.http.get<WeekendRule[]>(this.apiUrl).pipe(
      tap(data => this.weekendRules.set(data))
    );
  }

  loadAll(): void {
    this.getAll().subscribe();
  }

  getById(id: number): Observable<WeekendRule> {
    return this.http.get<WeekendRule>(`${this.apiUrl}/${id}`);
  }

  create(rule: WeekendRule): Observable<WeekendRule> {
    return this.http.post<WeekendRule>(this.apiUrl, rule).pipe(
      tap(() => this.loadAll())
    );
  }

  update(id: number, rule: WeekendRule): Observable<WeekendRule> {
    return this.http.put<WeekendRule>(`${this.apiUrl}/${id}`, rule).pipe(
      tap(() => this.loadAll())
    );
  }
}
