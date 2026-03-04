import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PayrollPayslip } from '../models/payroll-payslip.model';

@Injectable({
    providedIn: 'root'
})
export class PayslipService {
    private readonly apiUrl = `${environment.apiUrl}/payroll/payslips`;

    constructor(private http: HttpClient) { }

    getCurrentPayslipByEmployee(employeeId: number): Observable<PayrollPayslip> {
        return this.http.get<PayrollPayslip>(`${this.apiUrl}/current/employee/${employeeId}`);
    }

    getPayslipByRunAndEmployee(runId: number, employeeId: number): Observable<PayrollPayslip> {
        return this.http.get<PayrollPayslip[]>(`${environment.apiUrl}/payroll-runs/${runId}/payslips`).pipe(
            map((payslips: PayrollPayslip[]) => {
                const payslip = payslips.find((p: PayrollPayslip) => p.employeeId === employeeId);
                if (!payslip) throw new Error('Payslip not found for employee');
                return payslip;
            })
        );
    }
}
