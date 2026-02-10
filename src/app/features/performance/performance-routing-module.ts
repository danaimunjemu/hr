import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
  {
    path: '',
    component: PerformanceSettingsPageComponent,
    children: [
      { path: '', redirectTo: 'performance-cycle', pathMatch: 'full' },
      {
        path: 'performance-cycle',
        children: [
          { path: '', component: PerformanceCycleListComponent },
          { path: 'new', component: PerformanceCycleFormComponent },
          { path: 'edit/:id', component: PerformanceCycleFormComponent }
        ]
      },
      {
        path: 'goal-template',
        children: [
          { path: '', component: PerformanceGoalTemplateListComponent },
          { path: 'new', component: PerformanceGoalTemplateFormComponent },
          { path: 'view/:id', component: PerformanceGoalTemplateViewComponent },
          { path: 'edit/:id', component: PerformanceGoalTemplateFormComponent }
        ]
      },
      {
        path: 'goal-template-items',
        children: [
          { path: ':id', component: GoalTemplateItemsFormComponent }
        ]
      },
      {
        path: 'goal-settings',
        children: [
          { path: '', component: GoalSettingsListComponent },
          { path: 'assign', component: GoalSettingAssignmentFormComponent }
        ]
      },
      {
        path: 'review-360-setup',
        component: Review360SetupComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PerformanceRoutingModule { }
