import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface WorkContract {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkContractsService {
  private readonly API_URL = 'http://localhost:8090/api/work-contract';

  constructor(private http: HttpClient) {}

  getAll(): Observable<WorkContract[]> {
    return this.http.get<WorkContract[]>(this.API_URL).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch work contracts.')))
    );
  }

  getById(id: number): Observable<WorkContract> {
    return this.http.get<WorkContract>(`${this.API_URL}/${id}`).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch work contract details.')))
    );
  }

  create(entity: Partial<WorkContract>): Observable<WorkContract> {
    return this.http.post<WorkContract>(this.API_URL, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to create work contract.')))
    );
  }

  update(id: number, entity: Partial<WorkContract>): Observable<WorkContract> {
    return this.http.put<WorkContract>(`${this.API_URL}/${id}`, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to update work contract.')))
    );
  }
}
