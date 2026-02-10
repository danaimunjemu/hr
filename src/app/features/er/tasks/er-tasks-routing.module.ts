import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskListComponent } from './pages/task-list/task-list.component';
import { TaskCreateComponent } from './pages/task-create/task-create.component';
import { TaskEditComponent } from './pages/task-edit/task-edit.component';
import { TaskViewComponent } from './pages/task-view/task-view.component';

const routes: Routes = [
  { path: '', component: TaskListComponent },
  { path: 'create', component: TaskCreateComponent },
  { path: 'edit/:id', component: TaskEditComponent },
  { path: 'view/:id', component: TaskViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErTasksRoutingModule { }
