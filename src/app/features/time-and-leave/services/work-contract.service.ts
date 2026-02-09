import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkContract } from '../models/work-contract.model';

@Injectable({
  providedIn: 'root'
})
export class WorkContractService {
  private readonly apiUrl = 'http://localhost:8090/api/work-contract';

  constructor(private http: HttpClient) {}

  getAll(): Observable<WorkContract[]> {
    return this.http.get<WorkContract[]>(this.apiUrl);
  }

  getById(id: number): Observable<WorkContract> {
    return this.http.get<WorkContract>(`${this.apiUrl}/${id}`);
  }

  create(contract: WorkContract): Observable<WorkContract> {
    return this.http.post<WorkContract>(this.apiUrl, contract);
  }

  update(id: number, contract: WorkContract): Observable<WorkContract> {
    return this.http.put<WorkContract>(`${this.apiUrl}/${id}`, contract);
  }
}
