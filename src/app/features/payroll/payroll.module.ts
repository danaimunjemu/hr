import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { PayrollImportPage } from './pages/payroll-import/payroll-import.page';
import { PayslipGeneratorPage } from './pages/payslip-generator/payslip-generator.page';
import { EmployeePayslipsPage } from './pages/employee-payslips/employee-payslips.page';
import { PayrollAnalyticsPage } from './pages/payroll-analytics/payroll-analytics.page';
import { PayrollBatchListPage } from './pages/payroll-batch-list/payroll-batch-list.page';
import { PayrollBatchDetailsPage } from './pages/payroll-batch-details/payroll-batch-details.page';
import { MyPayslipPage } from './pages/my-payslip/my-payslip.page';

const routes: Routes = [
    { path: 'batches', component: PayrollBatchListPage },
    { path: 'batch/:id', component: PayrollBatchDetailsPage },
    { path: 'import', component: PayrollImportPage },
    { path: 'generate', component: PayslipGeneratorPage },
    { path: 'my-payslips', component: EmployeePayslipsPage },
    { path: 'my-current-payslip', component: MyPayslipPage },
    { path: 'view-payslip/:runId/:employeeId', component: MyPayslipPage },
    { path: 'analytics', component: PayrollAnalyticsPage },
    { path: '', redirectTo: 'batches', pathMatch: 'full' }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        PayrollImportPage,
        PayslipGeneratorPage,
        EmployeePayslipsPage,
        PayrollAnalyticsPage,
        PayrollBatchListPage,
        PayrollBatchDetailsPage,
        MyPayslipPage
    ]
})
export class PayrollModule { }
