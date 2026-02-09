import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecruitmentPageComponent } from './pages/recruitment-page/recruitment-page.component';

const routes: Routes = [
  { path: '', component: RecruitmentPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecruitmentRoutingModule { }
