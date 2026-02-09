import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveType } from '../models/leave-type.model';
import { LeaveBalance } from '../models/leave-balance.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private readonly typeUrl = 'http://localhost:8090/api/leave-types';
  private readonly balanceUrl = 'http://localhost:8090/api/leave-balances';

  constructor(private http: HttpClient) {}

  // Leave Types
  getAllTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(this.typeUrl);
  }

  getTypeById(id: number): Observable<LeaveType> {
    return this.http.get<LeaveType>(`${this.typeUrl}/${id}`);
  }

  createType(type: LeaveType): Observable<LeaveType> {
    return this.http.post<LeaveType>(this.typeUrl, type);
  }

  updateType(id: number, type: LeaveType): Observable<LeaveType> {
    return this.http.put<LeaveType>(`${this.typeUrl}/${id}`, type);
  }

  // Leave Balances
  getAllBalances(): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(this.balanceUrl);
  }

  getBalanceById(id: number): Observable<LeaveBalance> {
    return this.http.get<LeaveBalance>(`${this.balanceUrl}/${id}`);
  }

  createBalance(balance: LeaveBalance): Observable<LeaveBalance> {
    return this.http.post<LeaveBalance>(this.balanceUrl, balance);
  }

  updateBalance(id: number, balance: LeaveBalance): Observable<LeaveBalance> {
    return this.http.put<LeaveBalance>(`${this.balanceUrl}/${id}`, balance);
  }
}
