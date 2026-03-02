import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface LeaveBalanceReport {
  leaveType: { id: number; name: string; category?: string };
  leaveYear: number;
  openingBalance: number;
  entitlement: number;
  accrued: number;
  carryOver: number;
  adjustment: number;
  taken: number;
  pending: number;
  currentBalance: number;
  availableBalance: number;
}

export interface LeaveRequestReport {
  id: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  lineManagerApprovalStatus: string;
  hrApprovalStatus: string;
  leaveType: { id: number; name: string };
  cycleCode: string;
  createdOn?: string;
}

export interface AppraisalReport {
  id: number;
  status: string;
  finalScore: number | null;
  cycle: { id: number; name: string; startDate: string; endDate: string; active: boolean };
  goalSetting: {
    id: number;
    workFlowStatus: string;
    goals: { id: number; description: string; weight: number; measurement: string; dueDate: string }[];
  };
  appraisalItems: {
    id: number;
    goalItem: { id: number; description: string };
    selfRating: number | null;
    selfComment: string | null;
    managerRating: number | null;
    managerComment: string | null;
  }[];
  manager: { id: number; firstName: string; lastName: string };
  createdOn?: string;
}

export interface ErCaseReport {
  id: number;
  caseNumber: string;
  caseType: string;
  priority: string;
  status: string;
  title: string;
  summary: string;
  outcome: {
    id: number;
    outcomeType: string;
    decisionSummary: string;
    actionTaken: string;
    decisionAt: string;
    closeReason: string;
    closedAt: string;
  } | null;
  createdOn?: string;
}

export interface OffboardingReport {
  id: number;
  offboardingType: string;
  exitDate: string;
  reason: string;
  comments: string;
  approvalStatus: string;
  headOfDepartmentApprovalStatus: string;
  hrManagerApprovalStatus: string;
  headOfDepartmentApprovalComment: string;
  hrManagerApprovalComment: string;
  headOfDepartment: { id: number; firstName: string; lastName: string } | null;
  hrManager: { id: number; firstName: string; lastName: string } | null;
  createdOn?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeLifecycleService {
  private readonly API_URL = 'http://localhost:8090/api';

  constructor(private http: HttpClient) {}

  getLeaveBalances(employeeId: number): Observable<LeaveBalanceReport[]> {
    return this.http.get<LeaveBalanceReport[]>(
      `${this.API_URL}/reports/leave-balances`, { params: { employeeId: employeeId.toString() } }
    ).pipe(catchError(() => of([])));
  }

  getLeaveRequests(employeeId: number): Observable<LeaveRequestReport[]> {
    return this.http.get<LeaveRequestReport[]>(
      `${this.API_URL}/reports/leaves`, { params: { employeeId: employeeId.toString() } }
    ).pipe(catchError(() => of([])));
  }

  getAppraisals(employeeId: number): Observable<AppraisalReport[]> {
    return this.http.get<AppraisalReport[]>(
      `${this.API_URL}/appraisal/employee/${employeeId}`
    ).pipe(catchError(() => of([])));
  }

  getErCases(employeeId: number): Observable<ErCaseReport[]> {
    return this.http.get<ErCaseReport[]>(
      `${this.API_URL}/er/cases/employee/${employeeId}`
    ).pipe(catchError(() => of([])));
  }

  getOffboarding(employeeId: number): Observable<OffboardingReport[]> {
    return this.http.get<OffboardingReport[]>(
      `${this.API_URL}/offboarding/employee/${employeeId}`
    ).pipe(catchError(() => of([])));
  }
}
