import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ShiftDefinition } from '../models/shift-definition.model';

@Injectable({
  providedIn: 'root'
})
export class ShiftDefinitionService {
  private readonly apiUrl = 'http://localhost:8090/api/shift-definitions';

  shiftDefinitions = signal<ShiftDefinition[]>([]);

  constructor(private http: HttpClient) {}

  getAll(): Observable<ShiftDefinition[]> {
    return this.http.get<ShiftDefinition[]>(this.apiUrl).pipe(
      tap(data => this.shiftDefinitions.set(data))
    );
  }

  loadAll(): void {
    this.getAll().subscribe();
  }

  getById(id: number): Observable<ShiftDefinition> {
    return this.http.get<ShiftDefinition>(`${this.apiUrl}/${id}`);
  }

  create(shift: ShiftDefinition): Observable<ShiftDefinition> {
    return this.http.post<ShiftDefinition>(this.apiUrl, shift).pipe(
      tap(() => this.loadAll())
    );
  }

  update(id: number, shift: ShiftDefinition): Observable<ShiftDefinition> {
    return this.http.put<ShiftDefinition>(`${this.apiUrl}/${id}`, shift).pipe(
      tap(() => this.loadAll())
    );
  }
}
