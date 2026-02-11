import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Timesheet } from '../models/timesheet.model';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private readonly apiUrl = 'http://localhost:8090/api/timesheets';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Timesheet[]> {
    return this.http.get<Timesheet[]>(this.apiUrl);
  }

  getById(id: number): Observable<Timesheet> {
    return this.http.get<Timesheet>(`${this.apiUrl}/${id}`);
  }

  create(timesheet: Timesheet): Observable<Timesheet> {
    return this.http.post<Timesheet>(this.apiUrl, timesheet);
  }

  update(id: number, timesheet: Timesheet): Observable<Timesheet> {
    return this.http.put<Timesheet>(`${this.apiUrl}/${id}`, timesheet);
  }

  submit(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/submit`, {});
  }

  approve(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reject`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
