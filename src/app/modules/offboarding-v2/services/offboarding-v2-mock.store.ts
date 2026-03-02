import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {
  CreateOffboardingPayload,
  EmployeeSnapshot,
  OffboardingCase,
  OffboardingCaseSummary,
  OffboardingStatus,
  OffboardingType
} from '../models/offboarding-case.model';
import { EmployeeSummary } from '../models/employee-summary.model';
import {
  OffboardingTask,
  TaskCompletionPayload,
  TaskDepartment
} from '../models/offboarding-task.model';
import {
  AssetAcknowledgePayload,
  AssetReturnPayload,
  OffboardingAsset
} from '../models/offboarding-asset.model';
import {
  ExitInterviewResponse,
  ExitInterviewSubmitPayload
} from '../models/exit-interview.model';
import { OffboardingEvent } from '../models/offboarding-event.model';
import { WorkflowNode, WorkflowStatus } from '../models/workflow-status.model';
import { AttemptCompletionResponse } from './offboarding-v2-api.service';

interface AnalyticsBreakdown {
  label: string;
  value: number;
}

export interface OffboardingAnalytics {
  monthlyExits: number;
  turnoverRate: number;
  byRole: AnalyticsBreakdown[];
  byDepartment: AnalyticsBreakdown[];
  departmentRanking: AnalyticsBreakdown[];
}

@Injectable()
export class OffboardingV2MockStore {
  private readonly employees$ = new BehaviorSubject<EmployeeSummary[]>([
    {
      employeeId: '1001',
      employeeNumber: 'EMP001001',
      fullName: 'Amina Ndlovu',
      department: 'HR',
      jobTitle: 'HR Business Partner',
      organizationalUnit: 9010,
      managerId: null,
      managerName: '-',
      employeeType: 'Permanent',
      startDate: '2017-03-06',
      yearsOfService: 9
    },
    {
      employeeId: '1002',
      employeeNumber: 'EMP001002',
      fullName: 'Tariro Moyo',
      department: 'IT',
      jobTitle: 'Systems Analyst',
      organizationalUnit: 3010,
      managerId: '1004',
      managerName: 'James Dube',
      employeeType: 'Permanent',
      startDate: '2020-11-02',
      yearsOfService: 5
    },
    {
      employeeId: '1003',
      employeeNumber: 'EMP001003',
      fullName: 'Rudo Chikore',
      department: 'Finance',
      jobTitle: 'Finance Officer',
      organizationalUnit: 4020,
      managerId: '1004',
      managerName: 'James Dube',
      employeeType: 'Permanent',
      startDate: '2019-01-15',
      yearsOfService: 7
    },
    {
      employeeId: '1004',
      employeeNumber: 'EMP001004',
      fullName: 'James Dube',
      department: 'Operations',
      jobTitle: 'Line Manager',
      organizationalUnit: 4100,
      managerId: null,
      managerName: '-',
      employeeType: 'Permanent',
      startDate: '2015-07-20',
      yearsOfService: 11
    }
  ]);

  private readonly cases$ = new BehaviorSubject<Record<string, OffboardingCase>>({
    'OB-1001': {
      id: 'OB-1001',
      offboardingId: 'OB-1001',
      caseId: 'OB-1001',
      employeeId: '1002',
      initiator: 'LINE_MANAGER',
      status: 'IN_PROGRESS',
      employee: {
        employeeId: '1002',
        fullName: 'Tariro Moyo',
        department: 'IT',
        jobTitle: 'Systems Analyst',
        manager: 'James Dube',
        employeeType: 'Permanent',
        startDate: '2020-11-02',
        yearsOfService: 5
      },
      lastWorkingDate: '2026-03-30',
      noticePeriodStart: '2026-02-01',
      noticePeriodEnd: '2026-03-30',
      offboardingType: 'RESIGNATION',
      reason: 'Career progression',
      comments: 'Knowledge transfer in progress.',
      exitInterviewRequested: true,
      createdAt: '2026-02-10T10:00:00.000Z',
      updatedAt: '2026-02-17T09:00:00.000Z'
    },
    'OB-1002': {
      id: 'OB-1002',
      offboardingId: 'OB-1002',
      caseId: 'OB-1002',
      employeeId: '1003',
      initiator: 'HR',
      status: 'INITIATED',
      employee: {
        employeeId: '1003',
        fullName: 'Rudo Chikore',
        department: 'Finance',
        jobTitle: 'Finance Officer',
        manager: 'James Dube',
        employeeType: 'Permanent',
        startDate: '2019-01-15',
        yearsOfService: 7
      },
      lastWorkingDate: '2026-04-15',
      offboardingType: 'CONTRACT_EXPIRY',
      reason: 'Contract ended',
      exitInterviewRequested: false,
      createdAt: '2026-02-20T12:30:00.000Z',
      updatedAt: '2026-02-20T12:30:00.000Z'
    }
  });

  private readonly tasks$ = new BehaviorSubject<Record<string, OffboardingTask[]>>({
    'OB-1001': [
      {
        taskId: 'OB-1001-T1',
        offboardingId: 'OB-1001',
        department: 'IT',
        taskName: 'Revoke system access',
        taskOwnerId: 0,
        taskOwner: 'IT Owner',
        taskDeadline: '2026-03-10',
        completionStatus: 'OPEN'
      }
    ],
    'OB-1002': []
  });

  private readonly assetsByEmployee$ = new BehaviorSubject<Record<string, OffboardingAsset[]>>({
    '1002': [
      {
        assetNoteId: '1002-A1',
        employeeId: '1002',
        assetType: 'LAPTOP',
        assetId: 'LP-1091',
        description: 'Dell Latitude',
        serialNumber: 'SN-LP-1091',
        issueDate: '2023-02-05',
        returnStatus: 'NOT_RETURNED'
      }
    ],
    '1003': [
      {
        assetNoteId: '1003-A1',
        employeeId: '1003',
        assetType: 'ACCESS_CARDS',
        assetId: 'AC-5531',
        description: 'HQ Main Access Card',
        serialNumber: 'SN-AC-5531',
        issueDate: '2022-01-21',
        returnStatus: 'NOT_RETURNED'
      }
    ]
  });

  private readonly interviews$ = new BehaviorSubject<Record<string, ExitInterviewResponse>>({
    'OB-1001': {
      offboardingId: 'OB-1001',
      submitted: false,
      skipped: false
    },
    'OB-1002': {
      offboardingId: 'OB-1002',
      submitted: false,
      skipped: true
    }
  });

  private readonly events$ = new BehaviorSubject<Record<string, OffboardingEvent[]>>({});
  private sequence = 1002;

  getEmployees(): Observable<EmployeeSummary[]> {
    return of(this.employees$.value);
  }

  getSubordinates(managerId: string): Observable<EmployeeSummary[]> {
    return of(this.employees$.value.filter((employee) => employee.managerId === managerId));
  }

  createOffboarding(payload: CreateOffboardingPayload): Observable<OffboardingCase> {
    const employee = this.getEmployeeSummary(payload.employeeId);
    const id = `OB-${++this.sequence}`;
    const now = new Date().toISOString();
    const created: OffboardingCase = {
      id,
      offboardingId: id,
      caseId: id,
      employeeId: payload.employeeId,
      initiator: payload.initiator,
      status: 'INITIATED',
      employee: this.toEmployeeSnapshot(employee),
      lastWorkingDate: payload.exitDate,
      noticePeriodStart: payload.noticePeriodStart,
      noticePeriodEnd: payload.noticePeriodEnd,
      offboardingType: payload.offboardingType,
      reason: payload.reason,
      comments: payload.comments,
      exitInterviewRequested: payload.exitInterviewRequested,
      createdAt: now,
      updatedAt: now
    };

    this.cases$.next({ ...this.cases$.value, [id]: created });
    this.tasks$.next({ ...this.tasks$.value, [id]: this.generateTasks(id) });
    this.seedAssetsForEmployee(payload.employeeId);
    this.interviews$.next({
      ...this.interviews$.value,
      [id]: {
        offboardingId: id,
        submitted: false,
        skipped: !payload.exitInterviewRequested
      }
    });

    this.appendEvent(id, {
      actor: payload.initiator,
      action: 'CREATE_OFFBOARDING',
      entity: 'OFFBOARDING',
      notes: `Case created for ${employee.fullName}`
    });

    return of(created);
  }

  getEmployee(employeeId: string): Observable<EmployeeSnapshot> {
    return of(this.toEmployeeSnapshot(this.getEmployeeSummary(employeeId)));
  }

  getCase(offboardingId: string): Observable<OffboardingCase> {
    const existing = this.cases$.value[offboardingId];
    if (!existing) {
      return throwError(() => new Error('Offboarding case not found.'));
    }
    return of(existing);
  }

  getAllOffboardingCases(): Observable<OffboardingCaseSummary[]> {
    return of(this.mapCaseSummaries(Object.values(this.cases$.value)));
  }

  getOffboardingCasesByEmployee(employeeId: string): Observable<OffboardingCaseSummary[]> {
    return of(
      this.mapCaseSummaries(Object.values(this.cases$.value).filter((item) => item.employeeId === employeeId))
    );
  }

  getTasks(offboardingId: string): Observable<OffboardingTask[]> {
    return of(this.tasks$.value[offboardingId] || []);
  }

  completeTask(taskId: string, payload: TaskCompletionPayload): Observable<OffboardingTask> {
    const match = this.findTask(taskId);
    if (!match) {
      return throwError(() => new Error('Task not found.'));
    }

    const updatedTask: OffboardingTask = {
      ...match.task,
      completionStatus: payload.completed ? 'COMPLETED' : 'OPEN',
      completionDate: payload.completionDate,
      evidenceFilePath: payload.evidenceFilePath,
      systemName: payload.systemName,
      comment: payload.comment,
      accessRevoked: payload.accessRevoked,
      taskOwnerId: payload.taskOwnerId
    };

    const updatedList = this.tasks$.value[match.offboardingId].map((item) =>
      item.taskId === taskId ? updatedTask : item
    );
    this.tasks$.next({ ...this.tasks$.value, [match.offboardingId]: updatedList });
    this.refreshCaseStatus(match.offboardingId);

    this.appendEvent(match.offboardingId, {
      actor: String(payload.taskOwnerId),
      action: 'COMPLETE_TASK',
      entity: 'TASK',
      systemName: payload.systemName,
      accessRevoked: payload.accessRevoked,
      notes: `${updatedTask.taskName} marked completed.`
    });

    return of(updatedTask);
  }

  getAssets(employeeId: string): Observable<OffboardingAsset[]> {
    this.seedAssetsForEmployee(employeeId);
    return of(this.assetsByEmployee$.value[employeeId] || []);
  }

  returnAsset(assetNoteId: string, payload: AssetReturnPayload): Observable<OffboardingAsset> {
    const match = this.findAsset(assetNoteId);
    if (!match) {
      return throwError(() => new Error('Asset note not found.'));
    }

    const updated: OffboardingAsset = {
      ...match.asset,
      returnStatus: payload.returned ? 'RETURNED' : 'NOT_RETURNED',
      returned: payload.returned,
      returnDate: payload.returnDate,
      conditionOnReturn: payload.conditionOnReturn,
      remarks: payload.remarks
    };

    const nextList = this.assetsByEmployee$.value[match.employeeId].map((item) =>
      item.assetNoteId === assetNoteId ? updated : item
    );
    this.assetsByEmployee$.next({
      ...this.assetsByEmployee$.value,
      [match.employeeId]: nextList
    });

    const offboardingId = this.findOffboardingByEmployee(match.employeeId);
    if (offboardingId) {
      this.refreshCaseStatus(offboardingId);
      this.appendEvent(offboardingId, {
        actor: 'HR',
        action: 'ASSET_RETURN',
        entity: 'ASSET',
        notes: `${updated.assetId} updated to ${updated.returned ? 'RETURNED' : 'NOT_RETURNED'}`
      });
    }

    return of(updated);
  }

  acknowledgeAsset(
    assetNoteId: string,
    payload: AssetAcknowledgePayload
  ): Observable<OffboardingAsset> {
    const match = this.findAsset(assetNoteId);
    if (!match) {
      return throwError(() => new Error('Asset note not found.'));
    }

    const updated: OffboardingAsset = {
      ...match.asset,
      employeeConfirmed: payload.employeeConfirmed,
      disputeReason: payload.disputeReason,
      disputeEvidenceFilePath: payload.evidenceFilePath
    };

    const nextList = this.assetsByEmployee$.value[match.employeeId].map((item) =>
      item.assetNoteId === assetNoteId ? updated : item
    );

    this.assetsByEmployee$.next({
      ...this.assetsByEmployee$.value,
      [match.employeeId]: nextList
    });

    const offboardingId = this.findOffboardingByEmployee(match.employeeId);
    if (offboardingId) {
      this.refreshCaseStatus(offboardingId);
      this.appendEvent(offboardingId, {
        actor: 'EMPLOYEE',
        action: payload.employeeConfirmed ? 'ASSET_ACKNOWLEDGED' : 'ASSET_DISPUTED',
        entity: 'ASSET',
        notes: payload.disputeReason || 'Asset acknowledgement captured.'
      });
    }

    return of(updated);
  }

  getExitInterview(offboardingId: string): Observable<ExitInterviewResponse> {
    const current = this.interviews$.value[offboardingId] || {
      offboardingId,
      submitted: false,
      skipped: false
    };
    return of(current);
  }

  submitExitInterview(
    offboardingId: string,
    payload: ExitInterviewSubmitPayload
  ): Observable<ExitInterviewResponse> {
    const updated: ExitInterviewResponse = {
      offboardingId,
      ...payload,
      submitted: !payload.skipped,
      skipped: payload.skipped,
      submittedAt: new Date().toISOString()
    };

    this.interviews$.next({ ...this.interviews$.value, [offboardingId]: updated });
    this.refreshCaseStatus(offboardingId);
    this.appendEvent(offboardingId, {
      actor: 'EMPLOYEE',
      action: 'EXIT_INTERVIEW_SUBMIT',
      entity: 'EXIT_INTERVIEW',
      notes: payload.skipped ? 'Exit interview skipped.' : 'Exit interview submitted.'
    });

    return of(updated);
  }

  getWorkflowStatus(offboardingId: string): Observable<WorkflowStatus> {
    return of(this.computeWorkflow(offboardingId));
  }

  attemptComplete(offboardingId: string): Observable<AttemptCompletionResponse> {
    const workflow = this.computeWorkflow(offboardingId);
    const current = this.cases$.value[offboardingId];
    if (!current) {
      return throwError(() => new Error('Offboarding case not found.'));
    }

    const status: OffboardingStatus = workflow.readyForCompletion
      ? 'COMPLETED'
      : workflow.currentStatus;

    if (workflow.readyForCompletion) {
      this.cases$.next({
        ...this.cases$.value,
        [offboardingId]: {
          ...current,
          status,
          updatedAt: new Date().toISOString()
        }
      });
    }

    this.appendEvent(offboardingId, {
      actor: 'HR',
      action: 'ATTEMPT_COMPLETE',
      entity: 'OFFBOARDING',
      notes: workflow.readyForCompletion
        ? 'Offboarding completed.'
        : 'Completion blocked by pending checks.'
    });

    return of({
      offboardingId,
      status,
      readyForCompletion: workflow.readyForCompletion,
      message: workflow.readyForCompletion
        ? 'Offboarding case completed.'
        : 'Case is not ready for completion.'
    });
  }

  getEvents(offboardingId: string): Observable<OffboardingEvent[]> {
    return of(this.events$.value[offboardingId] || []);
  }

  getAnalytics(scopedEmployeeIds?: string[]): Observable<OffboardingAnalytics> {
    const cases = Object.values(this.cases$.value).filter(
      (item) => !scopedEmployeeIds || scopedEmployeeIds.includes(item.employeeId)
    );
    const monthlyExits = cases.length;
    const byDepartmentMap = new Map<string, number>();
    const byRoleMap = new Map<string, number>();

    for (const item of cases) {
      byDepartmentMap.set(item.employee.department, (byDepartmentMap.get(item.employee.department) || 0) + 1);
      byRoleMap.set(item.employee.jobTitle, (byRoleMap.get(item.employee.jobTitle) || 0) + 1);
    }

    const byDepartment = Array.from(byDepartmentMap.entries()).map(([label, value]) => ({ label, value }));
    const byRole = Array.from(byRoleMap.entries()).map(([label, value]) => ({ label, value }));

    return of({
      monthlyExits,
      turnoverRate: Number((monthlyExits * 1.2).toFixed(1)),
      byRole,
      byDepartment,
      departmentRanking: [...byDepartment].sort((a, b) => b.value - a.value)
    });
  }

  private mapCaseSummaries(cases: OffboardingCase[]): OffboardingCaseSummary[] {
    return cases
      .map((item) => this.toCaseSummary(item))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private toCaseSummary(item: OffboardingCase): OffboardingCaseSummary {
    const employee = this.getEmployeeSummary(item.employeeId);
    return {
      id:item.id,
      offboardingId: item.offboardingId,
      caseId: item.caseId,
      employeeId: item.employeeId,
      employeeName: employee.fullName,
      employeeNumber: employee.employeeNumber,
      department: employee.department,
      offboardingType: item.offboardingType,
      lastWorkingDate: item.lastWorkingDate,
      status: item.status,
      createdAt: item.createdAt
    };
  }

  private toEmployeeSnapshot(employee: EmployeeSummary): EmployeeSnapshot {
    return {
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      department: employee.department,
      jobTitle: employee.jobTitle,
      manager: employee.managerName || '-',
      employeeType: employee.employeeType,
      startDate: employee.startDate,
      yearsOfService: employee.yearsOfService
    };
  }

  private generateTasks(offboardingId: string): OffboardingTask[] {
    const today = new Date();
    const due = (days: number) => {
      const value = new Date(today);
      value.setDate(today.getDate() + days);
      return value.toISOString().slice(0, 10);
    };

    const create = (
      department: TaskDepartment,
      taskName: string,
      index: number
    ): OffboardingTask => ({
      taskId: `${offboardingId}-T${index}`,
      offboardingId,
      department,
      taskName,
      taskOwnerId: index,
      taskOwner: `${department} Owner`,
      taskDeadline: due(index + 2),
      completionStatus: 'OPEN'
    });

    return [
      create('HR', 'Schedule exit interview', 1),
      create('HR', 'Capture exit reason', 2),
      create('HR', 'Update employment status', 3),
      create('IT', 'Revoke system access', 4),
      create('IT', 'Disable email', 5),
      create('IT', 'Disable VPN access', 6),
      create('OPERATIONS', 'Recover access cards', 7),
      create('OPERATIONS', 'Recover keys', 8),
      create('LINE_MANAGER', 'Knowledge transfer completion', 9),
      create('LINE_MANAGER', 'Confirm handover completion', 10),
      create('FINANCE', 'Confirm outstanding advances', 11)
    ];
  }

  private seedAssetsForEmployee(employeeId: string): void {
    if (this.assetsByEmployee$.value[employeeId]) {
      return;
    }

    const seeded: OffboardingAsset[] = [
      {
        assetNoteId: `${employeeId}-A1`,
        employeeId,
        assetType: 'LAPTOP',
        assetId: 'LP-1091',
        description: 'Dell Latitude',
        serialNumber: 'SN-LP-1091',
        issueDate: '2023-02-05',
        returnStatus: 'NOT_RETURNED'
      }
    ];

    this.assetsByEmployee$.next({
      ...this.assetsByEmployee$.value,
      [employeeId]: seeded
    });
  }

  private getEmployeeSummary(employeeId: string): EmployeeSummary {
    const known = this.employees$.value.find((item) => item.employeeId === employeeId);
    if (known) {
      return known;
    }

    return {
      employeeId,
      employeeNumber: `EMP${employeeId}`,
      fullName: `Employee ${employeeId}`,
      department: 'Operations',
      jobTitle: 'Officer',
      organizationalUnit: 4000,
      managerId: null,
      managerName: '-',
      employeeType: 'Permanent',
      startDate: '2021-01-15',
      yearsOfService: 5
    };
  }

  private findTask(taskId: string): { offboardingId: string; task: OffboardingTask } | null {
    for (const offboardingId of Object.keys(this.tasks$.value)) {
      const task = this.tasks$.value[offboardingId].find((item) => item.taskId === taskId);
      if (task) {
        return { offboardingId, task };
      }
    }
    return null;
  }

  private findAsset(
    assetNoteId: string
  ): { employeeId: string; asset: OffboardingAsset } | null {
    for (const employeeId of Object.keys(this.assetsByEmployee$.value)) {
      const asset = this.assetsByEmployee$.value[employeeId].find(
        (item) => item.assetNoteId === assetNoteId
      );
      if (asset) {
        return { employeeId, asset };
      }
    }
    return null;
  }

  private findOffboardingByEmployee(employeeId: string): string | null {
    const value = Object.values(this.cases$.value).find((item) => item.employeeId === employeeId);
    return value?.offboardingId || null;
  }

  private appendEvent(
    offboardingId: string,
    payload: Omit<OffboardingEvent, 'eventId' | 'offboardingId' | 'timestamp'>
  ): void {
    const existing = this.events$.value[offboardingId] || [];
    const event: OffboardingEvent = {
      eventId: `${offboardingId}-EV-${existing.length + 1}`,
      offboardingId,
      timestamp: new Date().toISOString(),
      ...payload
    };
    this.events$.next({
      ...this.events$.value,
      [offboardingId]: [event, ...existing]
    });
  }

  private refreshCaseStatus(offboardingId: string): void {
    const current = this.cases$.value[offboardingId];
    if (!current) {
      return;
    }

    const workflow = this.computeWorkflow(offboardingId);
    this.cases$.next({
      ...this.cases$.value,
      [offboardingId]: {
        ...current,
        status: workflow.currentStatus,
        updatedAt: new Date().toISOString()
      }
    });
  }

  private computeWorkflow(offboardingId: string): WorkflowStatus {
    const current = this.cases$.value[offboardingId];
    const tasks = this.tasks$.value[offboardingId] || [];
    const assets = current ? this.assetsByEmployee$.value[current.employeeId] || [] : [];
    const interview = this.interviews$.value[offboardingId];

    const tasksCompleted = tasks.length > 0 && tasks.every((item) => item.completionStatus === 'COMPLETED');
    const assetsReturned = assets.length > 0 && assets.every((item) => item.returnStatus !== 'NOT_RETURNED');
    const assetsAcknowledged =
      assets.length > 0 &&
      assets.every((item) => item.employeeConfirmed === true && !item.disputeReason);
    const exitInterviewDone =
      (interview?.submitted ?? false) || current?.exitInterviewRequested === false;

    const readyForCompletion =
      tasksCompleted && assetsReturned && assetsAcknowledged && exitInterviewDone;

    let status: OffboardingStatus = 'INITIATED';
    if (readyForCompletion) {
      status = 'READY_FOR_COMPLETION';
    } else if (assets.some((item) => item.disputeReason)) {
      status = 'BLOCKED';
    } else if (tasks.some((item) => item.completionStatus === 'COMPLETED')) {
      status = 'IN_PROGRESS';
    }

    const nodes: WorkflowNode[] = [
      {
        code: 'INITIATION',
        label: 'Initiation',
        status: 'DONE'
      },
      {
        code: 'TASK_EXECUTION',
        label: 'Task Execution',
        status: tasksCompleted ? 'DONE' : tasks.length ? 'IN_PROGRESS' : 'PENDING'
      },
      {
        code: 'ASSETS_RECOVERY',
        label: 'Assets Recovery',
        status: assetsReturned ? 'DONE' : assets.length ? 'IN_PROGRESS' : 'PENDING'
      },
      {
        code: 'EMPLOYEE_ACKNOWLEDGEMENT',
        label: 'Employee Acknowledgement',
        status: assetsAcknowledged
          ? 'DONE'
          : assets.some((item) => item.disputeReason)
            ? 'BLOCKED'
            : 'IN_PROGRESS'
      },
      {
        code: 'EXIT_INTERVIEW',
        label: 'Exit Interview',
        status: exitInterviewDone ? 'DONE' : current?.exitInterviewRequested ? 'IN_PROGRESS' : 'DONE'
      },
      {
        code: 'COMPLETION_ATTEMPT',
        label: 'Completion Attempt',
        status: readyForCompletion ? 'DONE' : 'PENDING'
      },
      {
        code: 'COMPLETED',
        label: 'Completed',
        status: current?.status === 'COMPLETED' ? 'DONE' : 'PENDING'
      }
    ];

    return {
      offboardingId,
      nodes,
      readyForCompletion,
      currentStatus: current?.status === 'COMPLETED' ? 'COMPLETED' : status
    };
  }
}
