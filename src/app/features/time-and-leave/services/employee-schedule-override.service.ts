import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeScheduleOverride } from '../models/employee-schedule-override.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeScheduleOverrideService {
  private readonly apiUrl = 'http://localhost:8090/api/employee-schedule-overrides';

  constructor(private http: HttpClient) {}

  getAll(): Observable<EmployeeScheduleOverride[]> {
    return this.http.get<EmployeeScheduleOverride[]>(this.apiUrl);
  }

  getById(id: number): Observable<EmployeeScheduleOverride> {
    return this.http.get<EmployeeScheduleOverride>(`${this.apiUrl}/${id}`);
  }

  create(override: EmployeeScheduleOverride): Observable<EmployeeScheduleOverride> {
    return this.http.post<EmployeeScheduleOverride>(this.apiUrl, override);
  }

  update(id: number, override: EmployeeScheduleOverride): Observable<EmployeeScheduleOverride> {
    return this.http.put<EmployeeScheduleOverride>(`${this.apiUrl}/${id}`, override);
  }
}
