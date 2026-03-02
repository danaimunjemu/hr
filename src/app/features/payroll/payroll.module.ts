import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { PayrollImportPage } from './pages/payroll-import/payroll-import.page';
import { PayslipGeneratorPage } from './pages/payslip-generator/payslip-generator.page';
import { EmployeePayslipsPage } from './pages/employee-payslips/employee-payslips.page';
import { PayrollAnalyticsPage } from './pages/payroll-analytics/payroll-analytics.page';

const routes: Routes = [
    { path: 'import', component: PayrollImportPage },
    { path: 'generate', component: PayslipGeneratorPage },
    { path: 'my-payslips', component: EmployeePayslipsPage },
    { path: 'analytics', component: PayrollAnalyticsPage },
    { path: '', redirectTo: 'analytics', pathMatch: 'full' }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        PayrollImportPage,
        PayslipGeneratorPage,
        EmployeePayslipsPage,
        PayrollAnalyticsPage
    ]
})
export class PayrollModule { }
