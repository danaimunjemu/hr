import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ErCase } from '../models/er-case.model';

@Injectable({
  providedIn: 'root'
})
export class ErCaseService {
  private readonly apiUrl = 'http://localhost:8090/api/er/cases';

  constructor(private http: HttpClient) {}

  getCases(): Observable<ErCase[]> {
    return this.http.get<ErCase[]>(this.apiUrl);
  }

  getCase(id: number): Observable<ErCase> {
    return this.http.get<ErCase>(`${this.apiUrl}/${id}`);
  }

  createCase(dto: ErCase): Observable<ErCase> {
    return this.http.post<ErCase>(this.apiUrl, dto);
  }

  updateCase(dto: ErCase): Observable<ErCase> {
    return this.http.put<ErCase>(this.apiUrl, dto);
  }

  deleteCase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
