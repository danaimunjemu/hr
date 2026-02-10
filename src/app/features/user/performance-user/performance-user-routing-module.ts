import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerformanceUserPageComponent } from './pages/performance-user-page/performance-user-page';
import { AppraisalListComponent } from './pages/appraisal-list/appraisal-list';
import { AppraisalViewComponent } from './pages/appraisal-view/appraisal-view';
import { Review360ReviewListComponent } from './pages/review-360-review-list/review-360-review-list';

const routes: Routes = [
  {
    path: '',
    component: PerformanceUserPageComponent,
    children: [
      { path: '', redirectTo: 'appraisals', pathMatch: 'full' },
      { path: 'appraisals', component: AppraisalListComponent },
      { path: 'appraisals/view/:id', component: AppraisalViewComponent },
      { path: 'reviews', component: Review360ReviewListComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PerformanceUserRoutingModule { }
