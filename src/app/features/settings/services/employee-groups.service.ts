import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface EmployeeGroup {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeGroupsService {
  private readonly API_URL = 'http://localhost:8090/api/employee-group';

  constructor(private http: HttpClient) {}

  getEmployeeGroups(): Observable<EmployeeGroup[]> {
    return this.http.get<EmployeeGroup[]>(this.API_URL).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to fetch employee groups.'));
      })
    );
  }

  getEmployeeGroup(id: number): Observable<EmployeeGroup> {
    return this.http.get<EmployeeGroup>(`${this.API_URL}/${id}`).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to fetch employee group details.'));
      })
    );
  }

  createEmployeeGroup(employeeGroup: Partial<EmployeeGroup>): Observable<EmployeeGroup> {
    return this.http.post<EmployeeGroup>(this.API_URL, employeeGroup).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to create employee group.'));
      })
    );
  }

  updateEmployeeGroup(id: number, employeeGroup: Partial<EmployeeGroup>): Observable<EmployeeGroup> {
    return this.http.put<EmployeeGroup>(`${this.API_URL}/${id}`, employeeGroup).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to update employee group.'));
      })
    );
  }
}
