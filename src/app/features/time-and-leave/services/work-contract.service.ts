import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { WorkContract } from '../models/work-contract.model';

@Injectable({
  providedIn: 'root'
})
export class WorkContractService {
  private readonly apiUrl = 'http://localhost:8090/api/work-contract';

  // Expose signal for list
  workContracts = signal<WorkContract[]>([]);

  constructor(private http: HttpClient) {}

  getAll(): Observable<WorkContract[]> {
    return this.http.get<WorkContract[]>(this.apiUrl).pipe(
      tap(data => this.workContracts.set(data))
    );
  }

  loadAll(): void {
    this.getAll().subscribe();
  }

  getById(id: number): Observable<WorkContract> {
    return this.http.get<WorkContract>(`${this.apiUrl}/${id}`);
  }

  create(contract: WorkContract): Observable<WorkContract> {
    return this.http.post<WorkContract>(this.apiUrl, contract).pipe(
      tap(() => this.loadAll()) // Refresh list
    );
  }

  update(id: number, contract: WorkContract): Observable<WorkContract> {
    return this.http.put<WorkContract>(`${this.apiUrl}/${id}`, contract).pipe(
      tap(() => this.loadAll()) // Refresh list
    );
  }
}
