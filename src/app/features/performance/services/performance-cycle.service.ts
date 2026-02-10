import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerformanceCycle } from '../models/performance-cycle.model';

@Injectable({
  providedIn: 'root'
})
export class PerformanceCycleService {
  private readonly apiUrl = 'http://localhost:8090/api/performance-cycle';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PerformanceCycle[]> {
    return this.http.get<PerformanceCycle[]>(this.apiUrl);
  }

  getById(id: number): Observable<PerformanceCycle> {
    return this.http.get<PerformanceCycle>(`${this.apiUrl}/${id}`);
  }

  create(cycle: PerformanceCycle): Observable<PerformanceCycle> {
    return this.http.post<PerformanceCycle>(this.apiUrl, cycle);
  }

  update(id: number, cycle: PerformanceCycle): Observable<PerformanceCycle> {
    return this.http.put<PerformanceCycle>(`${this.apiUrl}/${id}`, cycle);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
