import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  OrganogramEmployeeProfile,
  OrganogramPositionResponse
} from './organogram.models';

@Injectable({
  providedIn: 'root'
})
export class OrganogramService {
  private readonly baseUrl = 'http://localhost:8090/api/organogram';

  constructor(private http: HttpClient) {}

  getOrganogram(): Observable<OrganogramPositionResponse[]> {
    return this.http.get<OrganogramPositionResponse[]>(this.baseUrl);
  }

  searchEmployee(query: string): Observable<unknown> {
    const params = new HttpParams().set('query', query);
    return this.http.get<unknown>(`${this.baseUrl}/search`, { params });
  }

  getEmployeeProfile(employeeId: number): Observable<OrganogramEmployeeProfile> {
    return this.http.get<OrganogramEmployeeProfile>(`${this.baseUrl}/employee/${employeeId}`);
  }

  getDepartmentOrganogram(organizationalUnitId: number): Observable<OrganogramPositionResponse[]> {
    return this.http.get<OrganogramPositionResponse[]>(`${this.baseUrl}/department/${organizationalUnitId}`);
  }
}
