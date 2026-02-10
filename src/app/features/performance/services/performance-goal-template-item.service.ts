import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerformanceGoalTemplateItem, AddGoalItemsRequest } from '../models/performance-goal-template-item.model';

@Injectable({
  providedIn: 'root'
})
export class PerformanceGoalTemplateItemService {
  private readonly apiUrl = 'http://localhost:8090/api/performance-goal-template-item';

  constructor(private http: HttpClient) {}

  getByTemplateId(templateId: number): Observable<PerformanceGoalTemplateItem[]> {
    return this.http.get<PerformanceGoalTemplateItem[]>(`${this.apiUrl}/template/${templateId}`);
  }

  addGoalItems(request: AddGoalItemsRequest): Observable<PerformanceGoalTemplateItem[]> {
    return this.http.post<PerformanceGoalTemplateItem[]>(`${this.apiUrl}/add-goal-items`, request);
  }

  getById(id: number): Observable<PerformanceGoalTemplateItem> {
    return this.http.get<PerformanceGoalTemplateItem>(`${this.apiUrl}/${id}`);
  }

  update(id: number, item: PerformanceGoalTemplateItem): Observable<PerformanceGoalTemplateItem> {
    return this.http.put<PerformanceGoalTemplateItem>(`${this.apiUrl}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
