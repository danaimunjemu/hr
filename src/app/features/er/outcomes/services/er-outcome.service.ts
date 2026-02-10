import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ErOutcome } from '../models/er-outcome.model';

@Injectable({
  providedIn: 'root'
})
export class ErOutcomeService {
  private readonly apiUrl = 'http://localhost:8090/api/er/outcomes';

  constructor(private http: HttpClient) {}

  getOutcomes(): Observable<ErOutcome[]> {
    return this.http.get<ErOutcome[]>(this.apiUrl);
  }

  getOutcome(id: number): Observable<ErOutcome> {
    return this.http.get<ErOutcome>(`${this.apiUrl}/${id}`);
  }

  createOutcome(dto: any): Observable<ErOutcome> {
    return this.http.post<ErOutcome>(this.apiUrl, dto);
  }

  updateOutcome(dto: any): Observable<ErOutcome> {
    return this.http.put<ErOutcome>(this.apiUrl, dto);
  }

  deleteOutcome(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
