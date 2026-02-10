import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrainingShellComponent } from './pages/training-shell/training-shell.component';
import { TrainingDashboardComponent } from './pages/training-dashboard/training-dashboard.component';
import { TrainingCalendarComponent } from './pages/training-calendar/training-calendar.component';
import { TrainingProgramsComponent } from './pages/training-programs/training-programs.component';
import { TrainingSessionsComponent } from './pages/training-sessions/training-sessions.component';
import { SkillsMatrixComponent } from './pages/skills-matrix/skills-matrix.component';

const routes: Routes = [
  {
    path: '',
    component: TrainingShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: TrainingDashboardComponent },
      { path: 'calendar', component: TrainingCalendarComponent },
      { path: 'programs', component: TrainingProgramsComponent },
      { path: 'sessions', component: TrainingSessionsComponent },
      { path: 'skills', component: SkillsMatrixComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainingAndSkillsRoutingModule { }
