import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ErTemplate } from '../models/er-template.model';

@Injectable({
  providedIn: 'root'
})
export class ErTemplateService {
  private readonly apiUrl = 'http://localhost:8090/api/er/templates';

  constructor(private http: HttpClient) {}

  getTemplates(): Observable<ErTemplate[]> {
    return this.http.get<ErTemplate[]>(this.apiUrl);
  }

  getTemplate(id: number): Observable<ErTemplate> {
    return this.http.get<ErTemplate>(`${this.apiUrl}/${id}`);
  }

  createTemplate(dto: Partial<ErTemplate>): Observable<ErTemplate> {
    return this.http.post<ErTemplate>(this.apiUrl, dto);
  }

  updateTemplate(dto: Partial<ErTemplate>): Observable<ErTemplate> {
    return this.http.put<ErTemplate>(this.apiUrl, dto);
  }

  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
