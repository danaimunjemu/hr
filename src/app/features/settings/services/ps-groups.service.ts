import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface PsGroup {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class PsGroupsService {
  private readonly API_URL = 'http://localhost:8090/api/ps-group';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PsGroup[]> {
    return this.http.get<PsGroup[]>(this.API_URL).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch PS groups.')))
    );
  }

  getById(id: number): Observable<PsGroup> {
    return this.http.get<PsGroup>(`${this.API_URL}/${id}`).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch PS group details.')))
    );
  }

  create(entity: Partial<PsGroup>): Observable<PsGroup> {
    return this.http.post<PsGroup>(this.API_URL, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to create PS group.')))
    );
  }

  update(id: number, entity: Partial<PsGroup>): Observable<PsGroup> {
    return this.http.put<PsGroup>(`${this.API_URL}/${id}`, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to update PS group.')))
    );
  }
}
