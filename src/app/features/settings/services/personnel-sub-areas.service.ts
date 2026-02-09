import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface PersonnelSubArea {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class PersonnelSubAreasService {
  private readonly API_URL = 'http://localhost:8090/api/personnel-sub-area';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PersonnelSubArea[]> {
    return this.http.get<PersonnelSubArea[]>(this.API_URL).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch personnel sub areas.')))
    );
  }

  getById(id: number): Observable<PersonnelSubArea> {
    return this.http.get<PersonnelSubArea>(`${this.API_URL}/${id}`).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch personnel sub area details.')))
    );
  }

  create(entity: Partial<PersonnelSubArea>): Observable<PersonnelSubArea> {
    return this.http.post<PersonnelSubArea>(this.API_URL, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to create personnel sub area.')))
    );
  }

  update(id: number, entity: Partial<PersonnelSubArea>): Observable<PersonnelSubArea> {
    return this.http.put<PersonnelSubArea>(`${this.API_URL}/${id}`, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to update personnel sub area.')))
    );
  }
}
