import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AntDesignModules } from '../../../core/modules/antdesign.module';
import { ErTasksRoutingModule } from './er-tasks-routing.module';

import { TaskListComponent } from './pages/task-list/task-list.component';
import { TaskCreateComponent } from './pages/task-create/task-create.component';
import { TaskEditComponent } from './pages/task-edit/task-edit.component';
import { TaskViewComponent } from './pages/task-view/task-view.component';

@NgModule({
  declarations: [
    TaskListComponent,
    TaskCreateComponent,
    TaskEditComponent,
    TaskViewComponent
  ],
  imports: [
    CommonModule,
    ErTasksRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AntDesignModules
  ]
})
export class ErTasksModule { }
