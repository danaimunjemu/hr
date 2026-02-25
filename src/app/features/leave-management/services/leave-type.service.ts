import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveType } from '../models/leave-type.model';

@Injectable({
    providedIn: 'root'
})
export class LeaveManagementTypeService {
    private readonly apiUrl = 'http://localhost:8090/api/leave-types';

    constructor(private http: HttpClient) { }

    getAll(): Observable<LeaveType[]> {
        return this.http.get<LeaveType[]>(this.apiUrl);
    }

    getById(id: number): Observable<LeaveType> {
        return this.http.get<LeaveType>(`${this.apiUrl}/${id}`);
    }

    create(type: LeaveType): Observable<LeaveType> {
        return this.http.post<LeaveType>(this.apiUrl, type);
    }

    update(id: number, type: LeaveType): Observable<LeaveType> {
        return this.http.put<LeaveType>(`${this.apiUrl}/${id}`, type);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
