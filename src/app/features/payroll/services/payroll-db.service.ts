import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { PayrollRecord } from '../models/payroll-record.model';
import { Payslip } from '../models/payslip.model';

@Injectable({
    providedIn: 'root'
})
export class PayrollDbService extends Dexie {
    payrollRecords!: Table<PayrollRecord, string>;
    payslips!: Table<Payslip, string>;

    constructor() {
        super('hr_payroll_db');
        this.version(1).stores({
            payrollRecords: 'id, employeeId, company, department, period',
            payslips: 'id, employeeId, period'
        });
    }
}
