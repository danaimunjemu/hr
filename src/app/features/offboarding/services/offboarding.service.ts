import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  OffboardingApprovalStatus,
  OffboardingCreateRequest,
  OffboardingRecord,
  OffboardingUpsertRequest
} from '../models/offboarding.model';

@Injectable({
  providedIn: 'root'
})
export class OffboardingService {
  private readonly baseUrl = 'http://localhost:8090/api/offboarding';

  constructor(private http: HttpClient) {}

  getAll(): Observable<OffboardingRecord[]> {
    return this.http.get<unknown[]>(this.baseUrl).pipe(
      map(items => items.map(item => this.toRecord(item))),
      catchError(this.handleError('Failed to load offboarding records.'))
    );
  }

  getById(id: number): Observable<OffboardingRecord> {
    return this.http.get<unknown>(`${this.baseUrl}/${id}`).pipe(
      map(item => this.toRecord(item)),
      catchError(this.handleError('Failed to load offboarding details.'))
    );
  }

  getByEmployeeId(employeeId: number): Observable<OffboardingRecord[]> {
    return this.http.get<unknown[]>(`${this.baseUrl}/employee/${employeeId}`).pipe(
      map(items => items.map(item => this.toRecord(item))),
      catchError(this.handleError('Failed to load employee offboarding records.'))
    );
  }

  create(payload: OffboardingCreateRequest): Observable<OffboardingRecord> {
    return this.http.post<unknown>(`${this.baseUrl}/create`, this.toCreatePayload(payload)).pipe(
      map(item => this.toRecord(item)),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404 || error.status === 405) {
          return this.createAlternative(payload);
        }
        return this.handleError('Failed to create offboarding record.')(error);
      })
    );
  }

  createAlternative(payload: OffboardingCreateRequest): Observable<OffboardingRecord> {
    return this.http.post<unknown>(`${this.baseUrl}/create`, this.toCreatePayload(payload)).pipe(
      map(item => this.toRecord(item)),
      catchError(this.handleError('Failed to create offboarding record.'))
    );
  }

  update(id: number, payload: OffboardingUpsertRequest): Observable<OffboardingRecord> {
    return this.http.put<unknown>(`${this.baseUrl}/${id}`, this.toApiPayload(payload)).pipe(
      map(item => this.toRecord(item)),
      catchError(this.handleError('Failed to update offboarding record.'))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError('Failed to delete offboarding record.'))
    );
  }

  approveHr(id: number, approvalStatus: OffboardingApprovalStatus, comment: string): Observable<OffboardingRecord> {
    return this.http
      .put<unknown>(`${this.baseUrl}/${id}/approve/hr`, {
        offboardingId: id,
        approvalStatus,
        comment
      })
      .pipe(
      map(item => this.toRecord(item)),
      catchError(this.handleError('Failed to approve offboarding record as HR.'))
    );
  }

  approveHod(id: number, approvalStatus: OffboardingApprovalStatus, comment: string): Observable<OffboardingRecord> {
    return this.http
      .put<unknown>(`${this.baseUrl}/${id}/approve/hod`, {
        offboardingId: id,
        approvalStatus,
        comment
      })
      .pipe(
      map(item => this.toRecord(item)),
      catchError(this.handleError('Failed to approve offboarding record as HOD.'))
    );
  }

  private toApiPayload(payload: OffboardingUpsertRequest): Record<string, unknown> {
    return {
      employeeId: payload.employeeId,
      offboardingType: payload.offboardingType,
      reason: payload.reason,
      lastWorkingDay: payload.lastWorkingDay,
      notes: payload.notes || null,
      // Keep compatibility with existing backend field names.
      exitDate: payload.lastWorkingDay,
      comments: payload.notes || null
    };
  }

  private toCreatePayload(payload: OffboardingCreateRequest): Record<string, unknown> {
    return {
      offboardingType: payload.offboardingType,
      exitDate: payload.exitDate,
      reason: payload.reason,
      comments: payload.comments || ''
    };
  }

  private toRecord(item: unknown): OffboardingRecord {
    const raw = item as Record<string, unknown>;
    const employee = (raw['employee'] as Record<string, unknown> | undefined) || {};
    const hrManager = (raw['hrManager'] as Record<string, unknown> | undefined) || {};
    const headOfDepartment = (raw['headOfDepartment'] as Record<string, unknown> | undefined) || {};
    const firstName = String(employee['firstName'] ?? '').trim();
    const lastName = String(employee['lastName'] ?? '').trim();
    const employeeName = `${firstName} ${lastName}`.trim();
    const hrManagerName = this.resolveFullName(hrManager);
    const headOfDepartmentName = this.resolveFullName(headOfDepartment);
    const approvalStatus = String(raw['approvalStatus'] ?? raw['status'] ?? 'PENDING');
    const headOfDepartmentApprovalStatus = String(raw['headOfDepartmentApprovalStatus'] ?? 'PENDING');
    const hrManagerApprovalStatus = String(raw['hrManagerApprovalStatus'] ?? 'PENDING');

    return {
      id: Number(raw['id'] ?? 0),
      employeeId: Number(raw['employeeId'] ?? employee['id'] ?? 0),
      employeeName: employeeName || (raw['employeeName'] as string | undefined),
      employeeNumber:
        (employee['employeeNumber'] as string | undefined) ||
        (raw['employeeNumber'] as string | undefined),
      offboardingType: (raw['offboardingType'] as string | undefined) || 'RESIGNATION',
      reason: (raw['reason'] as string | undefined) || '',
      lastWorkingDay:
        (raw['lastWorkingDay'] as string | undefined) ||
        (raw['exitDate'] as string | undefined) ||
        '',
      notes: (raw['notes'] as string | undefined) || (raw['comments'] as string | undefined),
      status: approvalStatus,
      approvalStatus,
      headOfDepartmentApprovalStatus,
      hrManagerApprovalStatus,
      headOfDepartmentApprovalComment: (raw['headOfDepartmentApprovalComment'] as string | undefined) || '',
      hrManagerApprovalComment: (raw['hrManagerApprovalComment'] as string | undefined) || '',
      headOfDepartmentApprovalOn: this.resolveTimestamp(raw, [
        'headOfDepartmentApprovalOn',
        'headOfDepartmentApprovedOn',
        'headOfDepartmentApprovalDate'
      ]),
      hrManagerApprovalOn: this.resolveTimestamp(raw, ['hrManagerApprovalOn', 'hrManagerApprovedOn', 'hrManagerApprovalDate']),
      headOfDepartmentName,
      hrManagerName,
      hrApproved:
        hrManagerApprovalStatus.toUpperCase() === 'APPROVED' ||
        Boolean(raw['hrApproved']) ||
        String(raw['hrApprovalStatus'] || '').toUpperCase() === 'APPROVED' ||
        approvalStatus.toUpperCase() === 'APPROVED',
      hodApproved:
        headOfDepartmentApprovalStatus.toUpperCase() === 'APPROVED' ||
        Boolean(raw['hodApproved']) ||
        String(raw['hodApprovalStatus'] || '').toUpperCase() === 'APPROVED' ||
        approvalStatus.toUpperCase() === 'APPROVED',
      createdOn: raw['createdOn'] as string | undefined,
      updatedOn: raw['updatedOn'] as string | undefined
    };
  }

  private resolveFullName(person: Record<string, unknown>): string {
    const firstName = String(person['firstName'] ?? '').trim();
    const lastName = String(person['lastName'] ?? '').trim();
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || String(person['username'] ?? person['email'] ?? '').trim();
  }

  private resolveTimestamp(raw: Record<string, unknown>, keys: string[]): string {
    const key = keys.find(item => raw[item]);
    return key ? String(raw[key]) : '';
  }

  private handleError(message: string) {
    return (error: HttpErrorResponse) => {
      const apiMessage = error?.error?.message as string | undefined;
      return throwError(() => new Error(apiMessage || message));
    };
  }
}
