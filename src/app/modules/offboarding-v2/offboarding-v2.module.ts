import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { OffboardingV2RoutingModule } from './offboarding-v2-routing.module';
import { InitiateOffboardingPageComponent } from './pages/initiate-offboarding-page/initiate-offboarding-page.component';
import { OffboardingCasePageComponent } from './pages/offboarding-case-page/offboarding-case-page.component';
import { AnalyticsDashboardPageComponent } from './pages/analytics-dashboard-page/analytics-dashboard-page.component';
import { FinalLeaveBalancePageComponent } from './pages/final-leave-balance-page/final-leave-balance-page.component';
import { RequestsListPageComponent } from './pages/requests-list-page/requests-list-page.component';
import { CaseHeaderCardComponent } from './components/case-header-card/case-header-card.component';
import { TasksBoardComponent } from './components/tasks-board/tasks-board.component';
import { TaskCompleteDrawerComponent } from './components/task-complete-drawer/task-complete-drawer.component';
import { WorkflowStepsComponent } from './components/workflow-steps/workflow-steps.component';
import { AssetsBoardComponent } from './components/assets-board/assets-board.component';
import { AssetReturnDrawerComponent } from './components/asset-return-drawer/asset-return-drawer.component';
import { AssetAckDrawerComponent } from './components/asset-ack-drawer/asset-ack-drawer.component';
import { ExitInterviewFormComponent } from './components/exit-interview-form/exit-interview-form.component';
import { AuditTableComponent } from './components/audit-table/audit-table.component';
import { OffboardingV2ApiService } from './services/offboarding-v2-api.service';
import { OffboardingV2MockStore } from './services/offboarding-v2-mock.store';
import { OffboardingV2FacadeService } from './services/offboarding-v2-facade.service';
import { UserContextService } from './services/user-context.service';
import { EmployeesV2Service } from './services/employees-v2.service';
import { CapitalizePipe } from '../../features/onboarding/capitalize-pipe';

@NgModule({
  declarations: [
    InitiateOffboardingPageComponent,
    OffboardingCasePageComponent,
    AnalyticsDashboardPageComponent,
    FinalLeaveBalancePageComponent,
    RequestsListPageComponent,
    CaseHeaderCardComponent,
    TasksBoardComponent,
    TaskCompleteDrawerComponent,
    WorkflowStepsComponent,
    AssetsBoardComponent,
    AssetReturnDrawerComponent,
    AssetAckDrawerComponent,
    ExitInterviewFormComponent,
    AuditTableComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AntDesignModules,
    // NzMessageModule,
    OffboardingV2RoutingModule,
    CapitalizePipe
  ],
  providers: [
    OffboardingV2ApiService,
    OffboardingV2MockStore,
    OffboardingV2FacadeService,
    EmployeesV2Service,
    UserContextService
  ],schemas:[CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA]
})
export class OffboardingV2Module {}
