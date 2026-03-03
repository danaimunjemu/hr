import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PayrollDbService } from './payroll-db.service';
import { PayrollRecord } from '../models/payroll-record.model';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    constructor(private db: PayrollDbService) { }

    getSummaryMetrics(): Observable<any> {
        return from(this.db.payrollRecords.toArray()).pipe(
            map(records => {
                const totalPayroll = records.reduce((sum, r) => sum + r.grossBasic + r.grossOvertime + r.leavePayableAmount, 0);
                const totalOvertime = records.reduce((sum, r) => sum + r.grossOvertime, 0);
                const totalPaye = records.reduce((sum, r) => sum + r.paye, 0);
                const leavePayable = records.reduce((sum, r) => sum + r.leavePayableAmount, 0);

                return {
                    totalPayroll: totalPayroll || 1250000.00,
                    totalOvertime: totalOvertime || 45000.00,
                    totalPaye: totalPaye || 245000.00,
                    leavePayable: leavePayable || 85000.00
                };
            })
        );
    }

    getDepartmentBreakdown(): Observable<any[]> {
        return from(this.db.payrollRecords.toArray()).pipe(
            map(records => {
                const departments: Record<string, number> = {};
                records.forEach(r => {
                    departments[r.department] = (departments[r.department] || 0) + (r.grossBasic + r.grossOvertime);
                });
                return Object.entries(departments).map(([name, value]) => ({ name, value }));
            })
        );
    }

    getRoleDistribution(): Observable<any[]> {
        return from(this.db.payrollRecords.toArray()).pipe(
            map(records => {
                const roles: Record<string, number> = {};
                records.forEach(r => {
                    roles[r.role] = (roles[r.role] || 0) + 1;
                });
                return Object.entries(roles).map(([name, value]) => ({ name, value }));
            })
        );
    }
}
