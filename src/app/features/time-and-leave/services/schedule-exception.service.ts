import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScheduleException } from '../models/schedule-exception.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleExceptionService {
  private readonly apiUrl = 'http://localhost:8090/api/schedule-exceptions';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ScheduleException[]> {
    return this.http.get<ScheduleException[]>(this.apiUrl);
  }

  getById(id: number): Observable<ScheduleException> {
    return this.http.get<ScheduleException>(`${this.apiUrl}/${id}`);
  }

  create(exception: ScheduleException): Observable<ScheduleException> {
    return this.http.post<ScheduleException>(this.apiUrl, exception);
  }

  update(id: number, exception: ScheduleException): Observable<ScheduleException> {
    return this.http.put<ScheduleException>(`${this.apiUrl}/${id}`, exception);
  }
}
