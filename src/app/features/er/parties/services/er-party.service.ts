import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ErParty } from '../models/er-party.model';

@Injectable({
  providedIn: 'root'
})
export class ErPartyService {
  private readonly apiUrl = 'http://localhost:8090/api/er/parties';

  constructor(private http: HttpClient) {}

  getParties(): Observable<ErParty[]> {
    return this.http.get<ErParty[]>(this.apiUrl);
  }

  getParty(id: number): Observable<ErParty> {
    return this.http.get<ErParty>(`${this.apiUrl}/${id}`);
  }

  createParty(dto: any): Observable<ErParty> {
    return this.http.post<ErParty>(this.apiUrl, dto);
  }

  updateParty(dto: any): Observable<ErParty> {
    return this.http.put<ErParty>(this.apiUrl, dto);
  }

  deleteParty(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
