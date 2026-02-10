import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeGroup } from '../models/employee-group.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeGroupService {
  private readonly apiUrl = 'http://localhost:8090/api/employee-group';

  constructor(private http: HttpClient) {}

  getAll(): Observable<EmployeeGroup[]> {
    return this.http.get<EmployeeGroup[]>(this.apiUrl);
  }

  getById(id: number): Observable<EmployeeGroup> {
    return this.http.get<EmployeeGroup>(`${this.apiUrl}/${id}`);
  }

  create(group: EmployeeGroup): Observable<EmployeeGroup> {
    return this.http.post<EmployeeGroup>(this.apiUrl, group);
  }

  update(id: number, group: EmployeeGroup): Observable<EmployeeGroup> {
    return this.http.put<EmployeeGroup>(`${this.apiUrl}/${id}`, group);
  }
}
