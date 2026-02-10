import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ErTask } from '../models/er-task.model';

@Injectable({
  providedIn: 'root'
})
export class ErTaskService {
  private readonly apiUrl = 'http://localhost:8090/api/er/tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<ErTask[]> {
    return this.http.get<ErTask[]>(this.apiUrl);
  }

  getTask(id: number): Observable<ErTask> {
    return this.http.get<ErTask>(`${this.apiUrl}/${id}`);
  }

  createTask(dto: Partial<ErTask>): Observable<ErTask> {
    return this.http.post<ErTask>(this.apiUrl, dto);
  }

  updateTask(dto: Partial<ErTask>): Observable<ErTask> {
    return this.http.put<ErTask>(this.apiUrl, dto);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
