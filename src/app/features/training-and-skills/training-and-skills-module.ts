import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrainingAndSkillsRoutingModule } from './training-and-skills-routing-module';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { SharedModule } from '../../shared/shared-module';
import { TrainingAndSkillsPageComponent } from './pages/training-and-skills-page/training-and-skills-page.component';


@NgModule({
  declarations: [
    TrainingAndSkillsPageComponent
  ],
  imports: [
    CommonModule,
    TrainingAndSkillsRoutingModule,
    AntDesignModules,
    SharedModule
  ]
})
export class TrainingAndSkillsModule { }
