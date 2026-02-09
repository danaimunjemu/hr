import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface Grade {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class GradesService {
  private readonly API_URL = 'http://localhost:8090/api/grade';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Grade[]> {
    return this.http.get<Grade[]>(this.API_URL).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch grades.')))
    );
  }

  getById(id: number): Observable<Grade> {
    return this.http.get<Grade>(`${this.API_URL}/${id}`).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch grade details.')))
    );
  }

  create(entity: Partial<Grade>): Observable<Grade> {
    return this.http.post<Grade>(this.API_URL, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to create grade.')))
    );
  }

  update(id: number, entity: Partial<Grade>): Observable<Grade> {
    return this.http.put<Grade>(`${this.API_URL}/${id}`, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to update grade.')))
    );
  }
}
