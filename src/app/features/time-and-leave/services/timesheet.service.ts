import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimesheetEntry } from '../models/timesheet-entry.model';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private readonly apiUrl = 'http://localhost:8090/api/timesheets';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TimesheetEntry[]> {
    return this.http.get<TimesheetEntry[]>(this.apiUrl);
  }

  getById(id: number): Observable<TimesheetEntry> {
    return this.http.get<TimesheetEntry>(`${this.apiUrl}/${id}`);
  }

  create(entry: TimesheetEntry): Observable<TimesheetEntry> {
    return this.http.post<TimesheetEntry>(this.apiUrl, entry);
  }

  update(id: number, entry: TimesheetEntry): Observable<TimesheetEntry> {
    return this.http.put<TimesheetEntry>(`${this.apiUrl}/${id}`, entry);
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
