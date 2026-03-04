import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaveDashboardComponent } from './pages/dashboard/leave-dashboard.component';
import { RequestListComponent } from './pages/requests/request-list/request-list.component';
import { RequestFormComponent } from './pages/requests/request-form/request-form.component';
import { BalanceListComponent } from './pages/balances/balance-list/balance-list.component';
import { LeaveTypeConfigComponent } from './pages/config/leave-type-config/leave-type-config.component';
import { AllocationPolicyConfigComponent } from './pages/config/allocation-config/allocation-config.component';
import { OffboardingPayoutComponent } from './pages/offboarding/offboarding-payout/offboarding-payout.component';
import { LeaveRequestDetailComponent } from './pages/requests/request-detail/request-detail.component';
import { MyLeaveRequestsComponent } from './pages/requests/my-requests/my-leave-requests.component';

const routes: Routes = [
    { path: '', component: LeaveDashboardComponent },
    { path: 'requests', component: RequestListComponent },
    { path: 'requests/my-requests', component: MyLeaveRequestsComponent },
    { path: 'requests/new', component: RequestFormComponent },
    { path: 'requests/:id', component: LeaveRequestDetailComponent },
    { path: 'requests/:id/edit', component: RequestFormComponent },
    { path: 'balances', component: BalanceListComponent },
    { path: 'config/types', component: LeaveTypeConfigComponent },
    { path: 'config/policies', component: AllocationPolicyConfigComponent },
    { path: 'offboarding', component: OffboardingPayoutComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LeaveManagementRoutingModule { }
