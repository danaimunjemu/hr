import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, shareReplay } from 'rxjs';
import {
  EmployeeProfileDto,
  OrganogramEmployeeSummary,
  OrganogramNode
} from '../models/organogram.model';

interface CachedValue<T> {
  expiresAt: number;
  value$: Observable<T>;
}

@Injectable()
export class OrganogramApiService {
  private readonly baseUrl = 'http://localhost:8090/api';
  private readonly searchCache = new Map<string, CachedValue<OrganogramEmployeeSummary[]>>();
  private readonly employeeCache = new Map<number, Observable<EmployeeProfileDto>>();
  private readonly departmentCache = new Map<number, Observable<OrganogramNode[]>>();
  private fullOrganogram$?: Observable<OrganogramNode[]>;

  constructor(private readonly http: HttpClient) {}

  searchEmployees(query: string): Observable<OrganogramEmployeeSummary[]> {
    const key = query.trim().toLowerCase();
    if (key.length < 2) {
      return of([]);
    }

    const now = Date.now();
    const cached = this.searchCache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value$;
    }

    const params = new HttpParams().set('query', key);
    const value$ = this.http
      .get<OrganogramEmployeeSummary[]>(`${this.baseUrl}/organogram/search`, { params })
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));

    this.searchCache.set(key, { expiresAt: now + 30_000, value$ });
    return value$;
  }

  getEmployeeProfile(employeeId: number): Observable<EmployeeProfileDto> {
    const cached = this.employeeCache.get(employeeId);
    if (cached) {
      return cached;
    }

    const value$ = this.http
      .get<EmployeeProfileDto>(`${this.baseUrl}/organogram/employee/${employeeId}`)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));

    this.employeeCache.set(employeeId, value$);
    return value$;
  }

  getDepartmentOrganogram(unitId: number): Observable<OrganogramNode[]> {
    const cached = this.departmentCache.get(unitId);
    if (cached) {
      return cached;
    }

    const value$ = this.http
      .get<OrganogramNode[]>(`${this.baseUrl}/organogram/department/${unitId}`)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));

    this.departmentCache.set(unitId, value$);
    return value$;
  }

  getFullOrganogram(): Observable<OrganogramNode[]> {
    if (this.fullOrganogram$) {
      return this.fullOrganogram$;
    }

    this.fullOrganogram$ = this.http
      .get<OrganogramNode[]>(`${this.baseUrl}/organogram`)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
    return this.fullOrganogram$;
  }
}
