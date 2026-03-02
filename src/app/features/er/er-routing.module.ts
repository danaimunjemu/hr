import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErWorkspaceComponent } from './er-workspace/er-workspace.component';
import { DisciplinaryAnalyticsPage } from './pages/disciplinary-analytics/disciplinary-analytics.page';
import { DisciplinaryRecordsPage } from './pages/disciplinary-records/disciplinary-records.page';
import { HearingsCalendarPage } from './pages/hearings-calendar/hearings-calendar.page';

const routes: Routes = [
  {
    path: '',
    component: ErWorkspaceComponent,
    children: [
      { path: '', redirectTo: 'cases', pathMatch: 'full' },
      {
        path: 'cases',
        loadChildren: () =>
          import('./cases/er-cases.module').then((m) => m.ErCasesModule),
        canActivate: [],
      },
      {
        path: 'tasks',
        loadChildren: () =>
          import('./tasks/er-tasks.module').then((m) => m.ErTasksModule),
        canActivate: [],
      },
      {
        path: 'templates',
        loadChildren: () =>
          import('./templates/er-templates.module').then((m) => m.ErTemplatesModule),
        canActivate: [],
      },
      {
        path: 'disciplinary-analytics',
        component: DisciplinaryAnalyticsPage
      },
      {
        path: 'disciplinary-records',
        component: DisciplinaryRecordsPage
      },
      {
        path: 'hearings-calendar',
        component: HearingsCalendarPage
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErRoutingModule { }
