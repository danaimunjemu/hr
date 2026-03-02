import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateOffboardingPayload,
  EmployeeSnapshot,
  OffboardingCase,
  OffboardingCaseSummary
} from '../models/offboarding-case.model';
import { OffboardingTask, TaskCompletionPayload } from '../models/offboarding-task.model';
import {
  AssetAcknowledgePayload,
  AssetReturnPayload,
  OffboardingAsset
} from '../models/offboarding-asset.model';
import {
  ExitInterviewResponse,
  ExitInterviewSubmitPayload
} from '../models/exit-interview.model';
import { WorkflowStatus } from '../models/workflow-status.model';
import { OffboardingEvent } from '../models/offboarding-event.model';

export interface AttemptCompletionResponse {
  offboardingId: string;
  status: 'INITIATED' | 'IN_PROGRESS' | 'BLOCKED' | 'READY_FOR_COMPLETION' | 'COMPLETED';
  readyForCompletion: boolean;
  message: string;
}

@Injectable()
export class OffboardingV2ApiService {
  private readonly baseUrl = 'http://localhost:8090/api';

  constructor(private readonly http: HttpClient) {}

  createOffboarding(payload: CreateOffboardingPayload): Observable<OffboardingCase> {
    return this.http.post<OffboardingCase>(`${this.baseUrl}/offboarding/create`, payload);
  }

  getEmployee(employeeId: string): Observable<EmployeeSnapshot> {
    return this.http.get<EmployeeSnapshot>(`${this.baseUrl}/offboarding/employee/${employeeId}`);
  }

  getTasks(offboardingId: string): Observable<OffboardingTask[]> {
    return this.http.get<OffboardingTask[]>(`${this.baseUrl}/offboarding-tasks/offboarding/${offboardingId}`);
  }

  completeTask(taskId: string, payload: TaskCompletionPayload): Observable<OffboardingTask> {
    return this.http.put<OffboardingTask>(`${this.baseUrl}/offboarding-tasks/${taskId}/complete`, payload);
  }

  getExitInterview(offboardingId: string): Observable<ExitInterviewResponse> {
    return this.http.get<ExitInterviewResponse>(`${this.baseUrl}/exit-interview/${offboardingId}`);
  }

  submitExitInterview(
    offboardingId: string,
    payload: ExitInterviewSubmitPayload
  ): Observable<ExitInterviewResponse> {
    return this.http.put<ExitInterviewResponse>(`${this.baseUrl}/exit-interview/${offboardingId}/submit`, payload);
  }

  getPendingAssets(employeeId: string): Observable<OffboardingAsset[]> {
    return this.http.get<OffboardingAsset[]>(`${this.baseUrl}/employee-asset-notes/employee/${employeeId}/unreturned`);
  }

  returnAsset(assetNoteId: string, payload: AssetReturnPayload): Observable<OffboardingAsset> {
    return this.http.put<OffboardingAsset>(`${this.baseUrl}/employee-asset-notes/${assetNoteId}/return`, payload);
  }

  acknowledgeAsset(
    assetNoteId: string,
    payload: AssetAcknowledgePayload
  ): Observable<OffboardingAsset> {
    return this.http.put<OffboardingAsset>(`${this.baseUrl}/employee-asset-notes/${assetNoteId}/acknowledge`, payload);
  }

  getWorkflowStatus(offboardingId: string): Observable<WorkflowStatus> {
    return this.http.get<WorkflowStatus>(`${this.baseUrl}/offboarding/${offboardingId}/workflow-status`);
  }

  attemptComplete(offboardingId: string): Observable<AttemptCompletionResponse> {
    return this.http.put<AttemptCompletionResponse>(`${this.baseUrl}/offboarding/${offboardingId}/attempt-complete`, {});
  }

  getEvents(offboardingId: string): Observable<OffboardingEvent[]> {
    return this.http.get<OffboardingEvent[]>(`${this.baseUrl}/offboarding-events/offboarding/${offboardingId}`);
  }

  getCase(offboardingId: string): Observable<OffboardingCase> {
    return this.http.get<OffboardingCase>(`${this.baseUrl}/offboarding/${offboardingId}`);
  }

  getCasesByEmployee(employeeId: string): Observable<OffboardingCaseSummary[]> {
    return this.http.get<OffboardingCaseSummary[]>(`${this.baseUrl}/offboarding/employee/${employeeId}`);
  }

  getAllCases(): Observable<OffboardingCaseSummary[]> {
    return this.http.get<OffboardingCaseSummary[]>(`${this.baseUrl}/offboarding`);
  }
}
