import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { ErRoutingModule } from './er-routing.module';

import { ErWorkspaceComponent } from './er-workspace/er-workspace.component';
import { ErCasesComponent } from './cases/er-cases.component';
import { ErIntakesComponent } from './intakes/er-intakes.component';
import { ErOutcomesComponent } from './outcomes/er-outcomes.component';
import { ErPartiesComponent } from './parties/er-parties.component';
import { ErTasksComponent } from './tasks/er-tasks.component';
import { ErTemplatesComponent } from './templates/er-templates.component';

@NgModule({
  declarations: [
    ErWorkspaceComponent,
    ErCasesComponent,
    ErIntakesComponent,
    ErOutcomesComponent,
    ErPartiesComponent,
    ErTasksComponent,
    ErTemplatesComponent
  ],
  imports: [
    CommonModule,
    ErRoutingModule,
    AntDesignModules
  ]
})
export class ErModule { }
