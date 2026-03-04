import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Page, PayrollBatch, PayrollBatchItem, PayrollDecisionRequest } from '../models/payroll-batch.model';

@Injectable({
    providedIn: 'root'
})
export class PayrollDataService {
    private readonly apiUrl = `${environment.apiUrl}/payroll-data`;

    constructor(private http: HttpClient) { }

    upload(file: File, companyId: number, year: number, month: number): Observable<PayrollBatch> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('companyId', companyId.toString());
        formData.append('year', year.toString());
        formData.append('month', month.toString());

        return this.http.post<PayrollBatch>(`${this.apiUrl}/upload`, formData);
    }

    getById(id: number): Observable<PayrollBatch> {
        return this.http.get<PayrollBatch>(`${this.apiUrl}/${id}`);
    }

    getItems(id: number, page: number = 0, size: number = 10): Observable<Page<PayrollBatchItem>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<Page<PayrollBatchItem>>(`${this.apiUrl}/${id}/items`, { params });
    }

    approve(id: number, request?: PayrollDecisionRequest): Observable<PayrollBatch> {
        return this.http.post<PayrollBatch>(`${this.apiUrl}/${id}/approve`, request || {});
    }

    reject(id: number, request?: PayrollDecisionRequest): Observable<PayrollBatch> {
        return this.http.post<PayrollBatch>(`${this.apiUrl}/${id}/reject`, request || {});
    }

    getAll(page: number = 0, size: number = 10): Observable<Page<PayrollBatch>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<Page<PayrollBatch>>(this.apiUrl, { params });
    }
}
