import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SafetyIncident,
  NearMissReport,
  MedicalSurveillance,
  Induction,
  CorrectiveAction,
  OhsWorkFlowApprovalRequestDto
} from '../models/ohs.model';

@Injectable({
  providedIn: 'root'
})
export class OhsService {
  private readonly API_URL = 'http://localhost:8090/api';

  constructor(private http: HttpClient) {}

  // --- Safety Incidents ---
  getSafetyIncidents(): Observable<SafetyIncident[]> {
    return this.http.get<SafetyIncident[]>(`${this.API_URL}/safety-incident`);
  }

  getSafetyIncident(id: string): Observable<SafetyIncident> {
    return this.http.get<SafetyIncident>(`${this.API_URL}/safety-incident/${id}`);
  }

  draftSafetyIncident(data: Partial<SafetyIncident>): Observable<SafetyIncident> {
    return this.http.post<SafetyIncident>(`${this.API_URL}/safety-incident/create-draft`, data);
  }

  submitSafetyIncident(data: Partial<SafetyIncident> | OhsWorkFlowApprovalRequestDto): Observable<SafetyIncident> {
    return this.http.post<SafetyIncident>(`${this.API_URL}/safety-incident/submit`, data);
  }

  approveSafetyIncident(data: OhsWorkFlowApprovalRequestDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/safety-incident/approve`, data);
  }

  rejectSafetyIncident(data: OhsWorkFlowApprovalRequestDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/safety-incident/reject`, data);
  }

  // --- Near Miss Reports ---
  getNearMissReports(): Observable<NearMissReport[]> {
    return this.http.get<NearMissReport[]>(`${this.API_URL}/near-miss-report`);
  }

  getNearMissReport(id: string): Observable<NearMissReport> {
    return this.http.get<NearMissReport>(`${this.API_URL}/near-miss-report/${id}`);
  }

  draftNearMissReport(data: Partial<NearMissReport>): Observable<NearMissReport> {
    return this.http.post<NearMissReport>(`${this.API_URL}/near-miss-report/create-draft`, data);
  }

  submitNearMissReport(data: Partial<NearMissReport> | OhsWorkFlowApprovalRequestDto): Observable<NearMissReport> {
    return this.http.post<NearMissReport>(`${this.API_URL}/near-miss-report/submit`, data);
  }

  approveNearMissReport(data: OhsWorkFlowApprovalRequestDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/near-miss-report/approve`, data);
  }

  rejectNearMissReport(data: OhsWorkFlowApprovalRequestDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/near-miss-report/reject`, data);
  }

  // --- Medical Surveillance ---
  getMedicalSurveillances(): Observable<MedicalSurveillance[]> {
    return this.http.get<MedicalSurveillance[]>(`${this.API_URL}/medical-surveillance`);
  }

  getMedicalSurveillance(id: string): Observable<MedicalSurveillance> {
    return this.http.get<MedicalSurveillance>(`${this.API_URL}/medical-surveillance/${id}`);
  }

  draftMedicalSurveillance(data: Partial<MedicalSurveillance>): Observable<MedicalSurveillance> {
    return this.http.post<MedicalSurveillance>(`${this.API_URL}/medical-surveillance/create-draft`, data);
  }

  submitMedicalSurveillance(data: Partial<MedicalSurveillance> | OhsWorkFlowApprovalRequestDto): Observable<MedicalSurveillance> {
    return this.http.post<MedicalSurveillance>(`${this.API_URL}/medical-surveillance/submit`, data);
  }

  approveMedicalSurveillance(data: OhsWorkFlowApprovalRequestDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/medical-surveillance/approve`, data);
  }

  rejectMedicalSurveillance(data: OhsWorkFlowApprovalRequestDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/medical-surveillance/reject`, data);
  }

  // --- Inductions ---
  getInductions(): Observable<Induction[]> {
    return this.http.get<Induction[]>(`${this.API_URL}/induction`);
  }

  getInduction(id: string): Observable<Induction> {
    return this.http.get<Induction>(`${this.API_URL}/induction/${id}`);
  }

  createInduction(data: Partial<Induction>): Observable<Induction> {
    return this.http.post<Induction>(`${this.API_URL}/induction`, data);
  }

  updateInduction(id: string, data: Partial<Induction>): Observable<Induction> {
    return this.http.put<Induction>(`${this.API_URL}/induction/${id}`, data);
  }

  deleteInduction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/induction/${id}`);
  }

  // --- Corrective Actions ---
  getCorrectiveActions(): Observable<CorrectiveAction[]> {
    return this.http.get<CorrectiveAction[]>(`${this.API_URL}/corrective-action`);
  }

  getCorrectiveAction(id: string): Observable<CorrectiveAction> {
    return this.http.get<CorrectiveAction>(`${this.API_URL}/corrective-action/${id}`);
  }

  createCorrectiveAction(data: Partial<CorrectiveAction>): Observable<CorrectiveAction> {
    return this.http.post<CorrectiveAction>(`${this.API_URL}/corrective-action`, data);
  }

  updateCorrectiveAction(id: string, data: Partial<CorrectiveAction>): Observable<CorrectiveAction> {
    return this.http.put<CorrectiveAction>(`${this.API_URL}/corrective-action/${id}`, data);
  }

  deleteCorrectiveAction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/corrective-action/${id}`);
  }
}
