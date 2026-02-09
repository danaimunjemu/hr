import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface JobDescription {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobDescriptionsService {
  private readonly API_URL = 'http://localhost:8090/api/job-description';

  constructor(private http: HttpClient) {}

  getAll(): Observable<JobDescription[]> {
    return this.http.get<JobDescription[]>(this.API_URL).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch job descriptions.')))
    );
  }

  getById(id: number): Observable<JobDescription> {
    return this.http.get<JobDescription>(`${this.API_URL}/${id}`).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to fetch job description details.')))
    );
  }

  create(entity: Partial<JobDescription>): Observable<JobDescription> {
    return this.http.post<JobDescription>(this.API_URL, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to create job description.')))
    );
  }

  update(id: number, entity: Partial<JobDescription>): Observable<JobDescription> {
    return this.http.put<JobDescription>(`${this.API_URL}/${id}`, entity).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Failed to update job description.')))
    );
  }
}
