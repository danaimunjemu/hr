import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PerformanceUserRoutingModule } from './performance-user-routing-module';
import { AntDesignModules } from '../../../core/modules/antdesign.module';
import { PerformanceUserPageComponent } from './pages/performance-user-page/performance-user-page';
import { AppraisalListComponent } from './pages/appraisal-list/appraisal-list';
import { AppraisalViewComponent } from './pages/appraisal-view/appraisal-view';
import { Review360ReviewListComponent } from './pages/review-360-review-list/review-360-review-list';

@NgModule({
  declarations: [
    PerformanceUserPageComponent,
    AppraisalListComponent,
    AppraisalViewComponent,
    Review360ReviewListComponent
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
