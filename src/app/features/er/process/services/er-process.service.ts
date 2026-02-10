import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ErCaseDto,
  ErAssignCaseRequestDto,
  ErCaseIntakeDto,
  ErCaseOutcomeDto,
  ErTaskNotes,
  ErCaseTaskDto,
  ErCasePartyDto,
  ErCaseTaskDocumentDto,
  ErCaseIntakeDocumentDto,
  ErCaseOutcomeDocumentDto
} from '../models/er-process.model';

@Injectable({
  providedIn: 'root'
})
export class ErProcessService {
  private readonly apiUrl = 'http://localhost:8090/api/er/process';

  constructor(private http: HttpClient) {}

  createCase(dto: ErCaseDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/cases`, dto);
  }

  assignCase(caseId: number, dto: ErAssignCaseRequestDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/cases/${caseId}/assign`, dto);
  }

  addIntake(caseId: number, dto: ErCaseIntakeDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/cases/${caseId}/intake`, dto);
  }

  addOutcome(caseId: number, dto: ErCaseOutcomeDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/cases/${caseId}/outcome`, dto);
  }

  closeCase(caseId: number, dto: ErTaskNotes): Observable<any> {
    return this.http.post(`${this.apiUrl}/cases/${caseId}/close`, dto);
  }

  addTask(caseId: number, dto: ErCaseTaskDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/cases/${caseId}/tasks`, dto);
  }

  completeTask(taskId: number, dto: ErTaskNotes): Observable<any> {
    return this.http.put(`${this.apiUrl}/tasks/${taskId}/complete`, dto);
  }

  addTaskParticipant(taskId: number, dto: ErCasePartyDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks/${taskId}/participants`, dto);
  }

  addTaskDocument(taskId: number, dto: ErCaseTaskDocumentDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks/${taskId}/documents`, dto);
  }

  addIntakeDocument(intakeId: number, dto: ErCaseIntakeDocumentDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/intakes/${intakeId}/documents`, dto);
  }

  addOutcomeDocument(outcomeId: number, dto: ErCaseOutcomeDocumentDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/outcomes/${outcomeId}/documents`, dto);
  }
}
