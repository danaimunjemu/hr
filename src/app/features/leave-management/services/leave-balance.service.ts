import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveBalance } from '../models/leave-balance.model';

@Injectable({
    providedIn: 'root'
})
export class LeaveManagementBalanceService {
    private readonly apiUrl = 'http://localhost:8090/api/leave-balances';

    constructor(private http: HttpClient) { }

    getAll(): Observable<LeaveBalance[]> {
        return this.http.get<LeaveBalance[]>(this.apiUrl);
    }

    getById(id: number): Observable<LeaveBalance> {
        return this.http.get<LeaveBalance>(`${this.apiUrl}/${id}`);
    }

    adjustNonStatutory(payload: { employeeId: number, leaveTypeId: number, days: number, reason: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/adjustments/non-statutory`, payload);
    }
}
