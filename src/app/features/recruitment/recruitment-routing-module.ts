import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecruitmentPageComponent } from './pages/recruitment-page/recruitment-page.component';

const routes: Routes = [
  { path: '', component: RecruitmentPageComponent },
  {
    path: 'job-vacancies',
    loadChildren: () => import('./job-vacancies/job-vacancy.routes').then(m => m.JOB_VACANCY_ROUTES)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecruitmentRoutingModule { }
