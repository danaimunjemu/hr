import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface OrganizationalUnit {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationalUnitsService {
  private readonly API_URL = 'http://localhost:8090/api/organizational-unit';

  constructor(private http: HttpClient) {}

  getAll(): Observable<OrganizationalUnit[]> {
    return this.http.get<OrganizationalUnit[]>(this.API_URL).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch organizational units.')))
    );
  }

  getById(id: number): Observable<OrganizationalUnit> {
    return this.http.get<OrganizationalUnit>(`${this.API_URL}/${id}`).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch organizational unit details.')))
    );
  }

  create(entity: Partial<OrganizationalUnit>): Observable<OrganizationalUnit> {
    return this.http.post<OrganizationalUnit>(this.API_URL, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to create organizational unit.')))
    );
  }

  update(id: number, entity: Partial<OrganizationalUnit>): Observable<OrganizationalUnit> {
    return this.http.put<OrganizationalUnit>(`${this.API_URL}/${id}`, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to update organizational unit.')))
    );
  }
}
