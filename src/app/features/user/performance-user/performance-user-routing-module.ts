import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerformanceUserPageComponent } from './pages/performance-user-page/performance-user-page';
import { AppraisalListComponent } from './pages/appraisal-list/appraisal-list';
import { AppraisalViewComponent } from './pages/appraisal-view/appraisal-view';
import { Review360ReviewListComponent } from './pages/review-360-review-list/review-360-review-list';
import { Review360FeedbackListComponent } from './pages/review-360-feedback-list/review-360-feedback-list';
import { TeamAppraisalListComponent } from './pages/team-appraisal-list/team-appraisal-list';
import { TeamAppraisalViewComponent } from './pages/team-appraisal-view/team-appraisal-view';

const routes: Routes = [
  {
    path: '',
    component: PerformanceUserPageComponent,
    children: [
      { path: '', redirectTo: 'appraisals', pathMatch: 'full' },
      { path: 'appraisals', component: AppraisalListComponent },
      { path: 'appraisals/view/:id', component: AppraisalViewComponent },
      { path: 'reviews', component: Review360ReviewListComponent },
      { path: 'reviews-feedback', component: Review360FeedbackListComponent },
      { path: 'team-appraisals', component: TeamAppraisalListComponent },
      { path: 'team-appraisals/view/:id', component: TeamAppraisalViewComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PerformanceUserRoutingModule { }
