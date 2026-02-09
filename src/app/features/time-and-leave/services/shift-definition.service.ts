import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShiftDefinition } from '../models/shift-definition.model';

@Injectable({
  providedIn: 'root'
})
export class ShiftDefinitionService {
  private readonly apiUrl = 'http://localhost:8090/api/shift-definitions';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ShiftDefinition[]> {
    return this.http.get<ShiftDefinition[]>(this.apiUrl);
  }

  getById(id: number): Observable<ShiftDefinition> {
    return this.http.get<ShiftDefinition>(`${this.apiUrl}/${id}`);
  }

  create(shift: ShiftDefinition): Observable<ShiftDefinition> {
    return this.http.post<ShiftDefinition>(this.apiUrl, shift);
  }

  update(id: number, shift: ShiftDefinition): Observable<ShiftDefinition> {
    return this.http.put<ShiftDefinition>(`${this.apiUrl}/${id}`, shift);
  }
}
