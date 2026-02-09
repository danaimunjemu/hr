import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface EthnicGroup {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class EthnicGroupsService {
  private readonly API_URL = 'http://localhost:8090/api/ethnic-group';

  constructor(private http: HttpClient) {}

  getAll(): Observable<EthnicGroup[]> {
    return this.http.get<EthnicGroup[]>(this.API_URL).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch ethnic groups.')))
    );
  }

  getById(id: number): Observable<EthnicGroup> {
    return this.http.get<EthnicGroup>(`${this.API_URL}/${id}`).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch ethnic group details.')))
    );
  }

  create(entity: Partial<EthnicGroup>): Observable<EthnicGroup> {
    return this.http.post<EthnicGroup>(this.API_URL, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to create ethnic group.')))
    );
  }

  update(id: number, entity: Partial<EthnicGroup>): Observable<EthnicGroup> {
    return this.http.put<EthnicGroup>(`${this.API_URL}/${id}`, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to update ethnic group.')))
    );
  }
}
