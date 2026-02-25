import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { SharedModule } from '../../shared/shared-module';
import { LeaveManagementRoutingModule } from './leave-management-routing.module';

// Pages - To be created
import { LeaveDashboardComponent } from './pages/dashboard/leave-dashboard.component';
import { RequestListComponent } from './pages/requests/request-list/request-list.component';
import { RequestFormComponent } from './pages/requests/request-form/request-form.component';
import { BalanceListComponent } from './pages/balances/balance-list/balance-list.component';
import { LeaveTypeConfigComponent } from './pages/config/leave-type-config/leave-type-config.component';
import { AllocationPolicyConfigComponent } from './pages/config/allocation-config/allocation-config.component';
import { OffboardingPayoutComponent } from './pages/offboarding/offboarding-payout/offboarding-payout.component';
import { LeaveRequestDetailComponent } from './pages/requests/request-detail/request-detail.component';

@NgModule({
    declarations: [
        LeaveDashboardComponent,
        RequestListComponent,
        RequestFormComponent,
        BalanceListComponent,
        LeaveTypeConfigComponent,
        AllocationPolicyConfigComponent,
        OffboardingPayoutComponent,
        LeaveRequestDetailComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AntDesignModules,
        SharedModule,
        LeaveManagementRoutingModule
    ]
})
export class LeaveManagementModule { }
