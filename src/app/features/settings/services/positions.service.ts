import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface SecondSuperior {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

export interface Position {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
  superior: string;
  secondSuperior: SecondSuperior;
  subordinates: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PositionsService {
  private readonly API_URL = 'http://localhost:8090/api/position';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Position[]> {
    return this.http.get<Position[]>(this.API_URL).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch positions.')))
    );
  }

  getById(id: number): Observable<Position> {
    return this.http.get<Position>(`${this.API_URL}/${id}`).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch position details.')))
    );
  }

  create(entity: Partial<Position>): Observable<Position> {
    return this.http.post<Position>(this.API_URL, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to create position.')))
    );
  }

  update(id: number, entity: Partial<Position>): Observable<Position> {
    return this.http.put<Position>(`${this.API_URL}/${id}`, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to update position.')))
    );
  }
}
