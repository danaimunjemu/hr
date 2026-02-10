import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { PerformanceRoutingModule } from './performance-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { AntDesignModules } from '../../core/modules/antdesign.module';

import { PerformanceSettingsPageComponent } from './pages/performance-settings-page/performance-settings-page';
import { PerformanceCycleListComponent } from './pages/performance-cycle/performance-cycle-list/performance-cycle-list';
import { PerformanceCycleFormComponent } from './pages/performance-cycle/performance-cycle-form/performance-cycle-form';
import { PerformanceGoalTemplateListComponent } from './pages/performance-goal-template/performance-goal-template-list/performance-goal-template-list';
import { PerformanceGoalTemplateFormComponent } from './pages/performance-goal-template/performance-goal-template-form/performance-goal-template-form';
import { PerformanceGoalTemplateViewComponent } from './pages/performance-goal-template/performance-goal-template-view/performance-goal-template-view';
import { GoalTemplateItemsFormComponent } from './pages/goal-template-items/goal-template-items-form/goal-template-items-form';
import { GoalSettingAssignmentFormComponent } from './pages/goal-setting-assignment/goal-setting-assignment-form/goal-setting-assignment-form';
import { GoalSettingsListComponent } from './pages/goal-settings/goal-settings-list/goal-settings-list';
import { Review360SetupComponent } from './pages/review-360-setup/review-360-setup';

@NgModule({
  declarations: [
    PerformanceSettingsPageComponent,
    PerformanceCycleListComponent,
    PerformanceCycleFormComponent,
    PerformanceGoalTemplateListComponent,
    PerformanceGoalTemplateFormComponent,
    PerformanceGoalTemplateViewComponent,
    GoalTemplateItemsFormComponent,
    GoalSettingAssignmentFormComponent,
    GoalSettingsListComponent,
    Review360SetupComponent
  ],
  imports: [
    CommonModule,
    PerformanceRoutingModule,
    AntDesignModules,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    RouterLink
  ]
})
export class PerformanceModule { }
