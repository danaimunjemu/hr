import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface PersonnelArea {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class PersonnelAreasService {
  private readonly API_URL = 'http://localhost:8090/api/personnel-area';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PersonnelArea[]> {
    return this.http.get<PersonnelArea[]>(this.API_URL).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch personnel areas.')))
    );
  }

  getById(id: number): Observable<PersonnelArea> {
    return this.http.get<PersonnelArea>(`${this.API_URL}/${id}`).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch personnel area details.')))
    );
  }

  create(entity: Partial<PersonnelArea>): Observable<PersonnelArea> {
    return this.http.post<PersonnelArea>(this.API_URL, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to create personnel area.')))
    );
  }

  update(id: number, entity: Partial<PersonnelArea>): Observable<PersonnelArea> {
    return this.http.put<PersonnelArea>(`${this.API_URL}/${id}`, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to update personnel area.')))
    );
  }
}
