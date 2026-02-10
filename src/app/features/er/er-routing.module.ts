import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErWorkspaceComponent } from './er-workspace/er-workspace.component';
import { ErCasesComponent } from './cases/er-cases.component';
import { ErIntakesComponent } from './intakes/er-intakes.component';
import { ErOutcomesComponent } from './outcomes/er-outcomes.component';
import { ErPartiesComponent } from './parties/er-parties.component';
import { ErTasksComponent } from './tasks/er-tasks.component';
import { ErTemplatesComponent } from './templates/er-templates.component';

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
        path: 'intakes',
        loadChildren: () =>
          import('./intakes/er-intakes.module').then((m) => m.ErIntakesModule),
        canActivate: [],
      },
      {
        path: 'outcomes',
        loadChildren: () =>
          import('./outcomes/er-outcomes.module').then((m) => m.ErOutcomesModule),
        canActivate: [],
      },
      {
        path: 'parties',
        loadChildren: () =>
          import('./parties/er-parties.module').then((m) => m.ErPartiesModule),
        canActivate: [],
      },
      {
        path: 'process',
        loadChildren: () =>
          import('./process/er-process.module').then((m) => m.ErProcessModule),
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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErRoutingModule { }
