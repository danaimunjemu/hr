import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface Company {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
  workLocation: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {
  private readonly API_URL = 'http://localhost:8090/api/company';

  constructor(private http: HttpClient) {}

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.API_URL).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to fetch companies.'));
      })
    );
  }

  getCompany(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.API_URL}/${id}`).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to fetch company details.'));
      })
    );
  }

  createCompany(company: Partial<Company>): Observable<Company> {
    return this.http.post<Company>(this.API_URL, company).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to create company.'));
      })
    );
  }

  updateCompany(id: number, company: Partial<Company>): Observable<Company> {
    return this.http.put<Company>(`${this.API_URL}/${id}`, company).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to update company.'));
      })
    );
  }
}
