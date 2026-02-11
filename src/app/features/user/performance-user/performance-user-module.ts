import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PerformanceUserRoutingModule } from './performance-user-routing-module';
import { AntDesignModules } from '../../../core/modules/antdesign.module';
import { PerformanceUserPageComponent } from './pages/performance-user-page/performance-user-page';
import { AppraisalListComponent } from './pages/appraisal-list/appraisal-list';
import { AppraisalViewComponent } from './pages/appraisal-view/appraisal-view';
import { Review360ReviewListComponent } from './pages/review-360-review-list/review-360-review-list';
import { Review360FeedbackListComponent } from './pages/review-360-feedback-list/review-360-feedback-list';
import { TeamAppraisalListComponent } from './pages/team-appraisal-list/team-appraisal-list';
import { TeamAppraisalViewComponent } from './pages/team-appraisal-view/team-appraisal-view';

@NgModule({
  declarations: [
    PerformanceUserPageComponent,
    AppraisalListComponent,
    AppraisalViewComponent,
    Review360ReviewListComponent,
    Review360FeedbackListComponent,
    TeamAppraisalListComponent,
    TeamAppraisalViewComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PerformanceUserRoutingModule,
    AntDesignModules
  ]
})
export class PerformanceUserModule { }
