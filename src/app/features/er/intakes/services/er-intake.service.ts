import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ErIntake } from '../models/er-intake.model';

@Injectable({
  providedIn: 'root'
})
export class ErIntakeService {
  private readonly apiUrl = 'http://localhost:8090/api/er/intakes';

  constructor(private http: HttpClient) {}

  getIntakes(): Observable<ErIntake[]> {
    return this.http.get<ErIntake[]>(this.apiUrl);
  }

  getIntake(id: number): Observable<ErIntake> {
    return this.http.get<ErIntake>(`${this.apiUrl}/${id}`);
  }

  createIntake(dto: any): Observable<ErIntake> {
    return this.http.post<ErIntake>(this.apiUrl, dto);
  }

  updateIntake(dto: any): Observable<ErIntake> {
    return this.http.put<ErIntake>(this.apiUrl, dto);
  }

  deleteIntake(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
