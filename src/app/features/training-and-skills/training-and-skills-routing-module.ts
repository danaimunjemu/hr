import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrainingAndSkillsPageComponent } from './pages/training-and-skills-page/training-and-skills-page.component';

const routes: Routes = [
  { path: '', component: TrainingAndSkillsPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainingAndSkillsRoutingModule { }
