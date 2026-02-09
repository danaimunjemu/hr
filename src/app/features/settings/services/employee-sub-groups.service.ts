import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface EmployeeSubGroup {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeSubGroupsService {
  private readonly API_URL = 'http://localhost:8090/api/employee-sub-group';

  constructor(private http: HttpClient) {}

  getEmployeeSubGroups(): Observable<EmployeeSubGroup[]> {
    return this.http.get<EmployeeSubGroup[]>(this.API_URL).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to fetch employee sub groups.'));
      })
    );
  }

  getEmployeeSubGroup(id: number): Observable<EmployeeSubGroup> {
    return this.http.get<EmployeeSubGroup>(`${this.API_URL}/${id}`).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to fetch employee sub group details.'));
      })
    );
  }

  createEmployeeSubGroup(employeeSubGroup: Partial<EmployeeSubGroup>): Observable<EmployeeSubGroup> {
    return this.http.post<EmployeeSubGroup>(this.API_URL, employeeSubGroup).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to create employee sub group.'));
      })
    );
  }

  updateEmployeeSubGroup(id: number, employeeSubGroup: Partial<EmployeeSubGroup>): Observable<EmployeeSubGroup> {
    return this.http.put<EmployeeSubGroup>(`${this.API_URL}/${id}`, employeeSubGroup).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to update employee sub group.'));
      })
    );
  }
}
