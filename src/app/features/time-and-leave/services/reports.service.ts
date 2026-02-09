import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TimesheetReport {
  employeeId: number;
  employeeName: string;
  workDate: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  totalHours: number;
  status: string;
}

export interface TimesheetSummaryReport {
  employeeId: number;
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  totalOvertimeHours: number;
}

export interface PayrollReport {
  employeeId: number;
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  regularHours: number;
  overtimeHours: number;
  grossPay: number; // Placeholder if backend calculates this
}

export interface LeaveBalanceReport {
  employeeId: number;
  employeeName: string;
  leaveType: string;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface LeaveReport {
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: string;
  daysTaken: number;
}

export interface LeaveUsageReport {
  employeeId: number;
  employeeName: string;
  leaveType: string;
  month: string;
  daysUsed: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private readonly apiUrl = 'http://localhost:8090/api/reports';

  constructor(private http: HttpClient) {}

  getTimesheets(filters: any): Observable<TimesheetReport[]> {
    let params = new HttpParams();
    if (filters.startDate) params = params.append('startDate', filters.startDate);
    if (filters.endDate) params = params.append('endDate', filters.endDate);
    if (filters.employeeId) params = params.append('employeeId', filters.employeeId);
    return this.http.get<TimesheetReport[]>(`${this.apiUrl}/timesheets`, { params });
  }

  getTimesheetSummary(filters: any): Observable<TimesheetSummaryReport[]> {
    let params = new HttpParams();
    if (filters.startDate) params = params.append('startDate', filters.startDate);
    if (filters.endDate) params = params.append('endDate', filters.endDate);
    if (filters.employeeId) params = params.append('employeeId', filters.employeeId);
    return this.http.get<TimesheetSummaryReport[]>(`${this.apiUrl}/timesheets/summary`, { params });
  }

  getPayroll(filters: any): Observable<PayrollReport[]> {
    let params = new HttpParams();
    if (filters.startDate) params = params.append('startDate', filters.startDate);
    if (filters.endDate) params = params.append('endDate', filters.endDate);
    if (filters.employeeId) params = params.append('employeeId', filters.employeeId);
    return this.http.get<PayrollReport[]>(`${this.apiUrl}/payroll`, { params });
  }

  getLeaveBalances(filters: any): Observable<LeaveBalanceReport[]> {
    let params = new HttpParams();
    if (filters.employeeId) params = params.append('employeeId', filters.employeeId);
    if (filters.leaveTypeId) params = params.append('leaveTypeId', filters.leaveTypeId);
    return this.http.get<LeaveBalanceReport[]>(`${this.apiUrl}/leave-balances`, { params });
  }

  getLeaves(filters: any): Observable<LeaveReport[]> {
    let params = new HttpParams();
    if (filters.startDate) params = params.append('startDate', filters.startDate);
    if (filters.endDate) params = params.append('endDate', filters.endDate);
    if (filters.employeeId) params = params.append('employeeId', filters.employeeId);
    if (filters.leaveTypeId) params = params.append('leaveTypeId', filters.leaveTypeId);
    return this.http.get<LeaveReport[]>(`${this.apiUrl}/leaves`, { params });
  }

  getLeaveUsage(filters: any): Observable<LeaveUsageReport[]> {
    let params = new HttpParams();
    if (filters.startDate) params = params.append('startDate', filters.startDate);
    if (filters.endDate) params = params.append('endDate', filters.endDate);
    if (filters.employeeId) params = params.append('employeeId', filters.employeeId);
    return this.http.get<LeaveUsageReport[]>(`${this.apiUrl}/leave-usage`, { params });
  }
}
