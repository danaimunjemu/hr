import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface CostCenter {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CostCentersService {
  private readonly API_URL = 'http://localhost:8090/api/cost-center';

  constructor(private http: HttpClient) {}

  getCostCenters(): Observable<CostCenter[]> {
    return this.http.get<CostCenter[]>(this.API_URL).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to fetch cost centers.'));
      })
    );
  }

  getCostCenter(id: number): Observable<CostCenter> {
    return this.http.get<CostCenter>(`${this.API_URL}/${id}`).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to fetch cost center details.'));
      })
    );
  }

  createCostCenter(costCenter: Partial<CostCenter>): Observable<CostCenter> {
    return this.http.post<CostCenter>(this.API_URL, costCenter).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to create cost center.'));
      })
    );
  }

  updateCostCenter(id: number, costCenter: Partial<CostCenter>): Observable<CostCenter> {
    return this.http.put<CostCenter>(`${this.API_URL}/${id}`, costCenter).pipe(
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to update cost center.'));
      })
    );
  }
}
