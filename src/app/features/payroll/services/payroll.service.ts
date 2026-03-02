import { Injectable } from '@angular/core';
import { from, Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { PayrollDbService } from './payroll-db.service';
import { PayrollRecord } from '../models/payroll-record.model';
import { Payslip } from '../models/payslip.model';
import { DUMMY_PAYROLL_DATA } from '../seed/dummy-payroll.seed';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class PayrollService {
    private recordsSubject = new BehaviorSubject<PayrollRecord[]>([]);
    records$ = this.recordsSubject.asObservable();

    constructor(private db: PayrollDbService) {
        this.initDatabase();
    }

    private async initDatabase() {
        const count = await this.db.payrollRecords.count();
        if (count === 0) {
            await this.db.payrollRecords.bulkAdd(DUMMY_PAYROLL_DATA);
        }
        this.refreshRecords();
    }

    async refreshRecords() {
        const records = await this.db.payrollRecords.toArray();
        this.recordsSubject.next(records);
    }

    getAllRecords(): Observable<PayrollRecord[]> {
        return from(this.db.payrollRecords.toArray());
    }

    getRecordsByPeriod(period: string): Observable<PayrollRecord[]> {
        return from(this.db.payrollRecords.where('period').equals(period).toArray());
    }

    importRecords(records: PayrollRecord[]): Observable<void> {
        return from(this.db.payrollRecords.bulkAdd(records)).pipe(
            tap(() => this.refreshRecords()),
            map(() => void 0)
        );
    }

    generatePayslip(record: PayrollRecord): Observable<Payslip> {
        const netPay = record.grossBasic + record.grossOvertime - record.paye + record.leavePayableAmount;
        const payslip: Payslip = {
            id: uuidv4(),
            employeeId: record.employeeId,
            period: record.period,
            generatedAt: new Date().toISOString(),
            templateVersion: '1.0.0',
            grossBasic: record.grossBasic,
            grossOvertime: record.grossOvertime,
            paye: record.paye,
            leavePayableAmount: record.leavePayableAmount,
            netPay
        };
        return from(this.db.payslips.add(payslip)).pipe(
            map(() => payslip)
        );
    }

    getPayslipsByEmployee(employeeId: number): Observable<Payslip[]> {
        return from(this.db.payslips.where('employeeId').equals(employeeId).toArray());
    }
}
