import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InitiateOffboardingPageComponent } from './pages/initiate-offboarding-page/initiate-offboarding-page.component';
import { OffboardingCasePageComponent } from './pages/offboarding-case-page/offboarding-case-page.component';
import { AnalyticsDashboardPageComponent } from './pages/analytics-dashboard-page/analytics-dashboard-page.component';
import { FinalLeaveBalancePageComponent } from './pages/final-leave-balance-page/final-leave-balance-page.component';
import { RequestsListPageComponent } from './pages/requests-list-page/requests-list-page.component';
import { offboardingV2AnalyticsGuard } from './guards/offboarding-v2-analytics.guard';

const routes: Routes = [
  { path: '', component: RequestsListPageComponent },
  { path: 'initiate', component: InitiateOffboardingPageComponent },
  { path: 'analytics', canActivate: [offboardingV2AnalyticsGuard], component: AnalyticsDashboardPageComponent },
  { path: 'case/:offboardingId', component: OffboardingCasePageComponent },
  {
    path: 'case/:offboardingId/analytics',
    canActivate: [offboardingV2AnalyticsGuard],
    component: AnalyticsDashboardPageComponent
  },
  { path: 'case/:offboardingId/final-leave', component: FinalLeaveBalancePageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OffboardingV2RoutingModule {}
