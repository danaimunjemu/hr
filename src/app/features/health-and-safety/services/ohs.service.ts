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
  private readonly API_URL = 'http://localhost:8090/api/ohs'; // Adjust base URL as needed

  constructor(private http: HttpClient) {}

  // --- Safety Incidents ---
  getSafetyIncidents(): Observable<SafetyIncident[]> {
    return this.http.get<SafetyIncident[]>(`${this.API_URL}/safety-incidents`);
  }

  getSafetyIncident(id: string): Observable<SafetyIncident> {
    return this.http.get<SafetyIncident>(`${this.API_URL}/safety-incidents/${id}`);
  }

  draftSafetyIncident(data: Partial<SafetyIncident>): Observable<SafetyIncident> {
    return this.http.post<SafetyIncident>(`${this.API_URL}/safety-incidents/draft`, data);
  }

  submitSafetyIncident(data: Partial<SafetyIncident>): Observable<SafetyIncident> {
    return this.http.post<SafetyIncident>(`${this.API_URL}/safety-incidents/submit`, data);
  }

  approveSafetyIncident(data: OhsWorkFlowApprovalRequestDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/safety-incidents/approve`, data);
  }

  rejectSafetyIncident(data: OhsWorkFlowApprovalRequestDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/safety-incidents/reject`, data);
  }

  // --- Near Miss Reports ---
  getNearMissReports(): Observable<NearMissReport[]> {
    return this.http.get<NearMissReport[]>(`${this.API_URL}/near-miss-reports`);
  }

  getNearMissReport(id: string): Observable<NearMissReport> {
    return this.http.get<NearMissReport>(`${this.API_URL}/near-miss-reports/${id}`);
  }

  draftNearMissReport(data: Partial<NearMissReport>): Observable<NearMissReport> {
    return this.http.post<NearMissReport>(`${this.API_URL}/near-miss-reports/draft`, data);
  }

  submitNearMissReport(data: Partial<NearMissReport>): Observable<NearMissReport> {
    return this.http.post<NearMissReport>(`${this.API_URL}/near-miss-reports/submit`, data);
  }

  approveNearMissReport(data: OhsWorkFlowApprovalRequestDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/near-miss-reports/approve`, data);
  }

  rejectNearMissReport(data: OhsWorkFlowApprovalRequestDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/near-miss-reports/reject`, data);
  }

  // --- Medical Surveillance ---
  getMedicalSurveillances(): Observable<MedicalSurveillance[]> {
    return this.http.get<MedicalSurveillance[]>(`${this.API_URL}/medical-surveillances`);
  }

  getMedicalSurveillance(id: string): Observable<MedicalSurveillance> {
    return this.http.get<MedicalSurveillance>(`${this.API_URL}/medical-surveillances/${id}`);
  }

  draftMedicalSurveillance(data: Partial<MedicalSurveillance>): Observable<MedicalSurveillance> {
    return this.http.post<MedicalSurveillance>(`${this.API_URL}/medical-surveillances/draft`, data);
  }

  submitMedicalSurveillance(data: Partial<MedicalSurveillance>): Observable<MedicalSurveillance> {
    return this.http.post<MedicalSurveillance>(`${this.API_URL}/medical-surveillances/submit`, data);
  }

  approveMedicalSurveillance(data: OhsWorkFlowApprovalRequestDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/medical-surveillances/approve`, data);
  }

  rejectMedicalSurveillance(data: OhsWorkFlowApprovalRequestDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/medical-surveillances/reject`, data);
  }

  // --- Inductions ---
  getInductions(): Observable<Induction[]> {
    return this.http.get<Induction[]>(`${this.API_URL}/inductions`);
  }

  getInduction(id: string): Observable<Induction> {
    return this.http.get<Induction>(`${this.API_URL}/inductions/${id}`);
  }

  createInduction(data: Partial<Induction>): Observable<Induction> {
    return this.http.post<Induction>(`${this.API_URL}/inductions`, data);
  }

  updateInduction(id: string, data: Partial<Induction>): Observable<Induction> {
    return this.http.put<Induction>(`${this.API_URL}/inductions/${id}`, data);
  }

  deleteInduction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/inductions/${id}`);
  }

  // --- Corrective Actions ---
  getCorrectiveActions(): Observable<CorrectiveAction[]> {
    return this.http.get<CorrectiveAction[]>(`${this.API_URL}/corrective-actions`);
  }

  getCorrectiveAction(id: string): Observable<CorrectiveAction> {
    return this.http.get<CorrectiveAction>(`${this.API_URL}/corrective-actions/${id}`);
  }

  createCorrectiveAction(data: Partial<CorrectiveAction>): Observable<CorrectiveAction> {
    return this.http.post<CorrectiveAction>(`${this.API_URL}/corrective-actions`, data);
  }

  updateCorrectiveAction(id: string, data: Partial<CorrectiveAction>): Observable<CorrectiveAction> {
    return this.http.put<CorrectiveAction>(`${this.API_URL}/corrective-actions/${id}`, data);
  }

  deleteCorrectiveAction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/corrective-actions/${id}`);
  }
}
