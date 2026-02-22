// offboarding.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Offboarding } from '../offboarding.types';

@Injectable({ providedIn: 'root' })
export class OffboardingService {
  private readonly baseUrl = 'http://localhost:8090/api/offboarding';

  constructor(private http: HttpClient) {}

  create(payload: {
    offboardingType: string;
    exitDate: string;
    reason: string;
    comments?: string;
  }): Observable<Offboarding> {
    return this.http.post<Offboarding>(this.baseUrl, payload);
  }

  getById(id: number): Observable<Offboarding> {
    return this.http.get<Offboarding>(`${this.baseUrl}/${id}`);
  }

  getByEmployee(employeeId: number): Observable<Offboarding[]> {
    return this.http.get<Offboarding[]>(`${this.baseUrl}/employee/${employeeId}`);
  }

  getAll(): Observable<Offboarding[]> {
    return this.http.get<Offboarding[]>(this.baseUrl);
  }

  approveByHr(id: number): Observable<Offboarding> {
    return this.http.put<Offboarding>(`${this.baseUrl}/${id}/approve/hr`, {});
  }

  approveByHod(id: number): Observable<Offboarding> {
    return this.http.put<Offboarding>(`${this.baseUrl}/${id}/approve/hod`, {});
  }
}
