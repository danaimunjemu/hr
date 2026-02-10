import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TrainingAndSkillsRoutingModule } from './training-and-skills-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { AntDesignModules } from '../../core/modules/antdesign.module';

import { TrainingShellComponent } from './pages/training-shell/training-shell.component';
import { TrainingDashboardComponent } from './pages/training-dashboard/training-dashboard.component';
import { TrainingCalendarComponent } from './pages/training-calendar/training-calendar.component';
import { TrainingProgramsComponent } from './pages/training-programs/training-programs.component';
import { TrainingSessionsComponent } from './pages/training-sessions/training-sessions.component';
import { SkillsMatrixComponent } from './pages/skills-matrix/skills-matrix.component';
import { TrainingService } from './services/training.service';

@NgModule({
  declarations: [
    TrainingShellComponent,
    TrainingDashboardComponent,
    TrainingCalendarComponent,
    TrainingProgramsComponent,
    TrainingSessionsComponent,
    SkillsMatrixComponent
  ],
  imports: [
    CommonModule,
    TrainingAndSkillsRoutingModule,
    SharedModule,
    AntDesignModules,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    TrainingService
  ]
})
export class TrainingAndSkillsModule { }
