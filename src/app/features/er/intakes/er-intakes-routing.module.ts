import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntakeListComponent } from './pages/intake-list/intake-list.component';
import { IntakeCreateComponent } from './pages/intake-create/intake-create.component';
import { IntakeEditComponent } from './pages/intake-edit/intake-edit.component';
import { IntakeViewComponent } from './pages/intake-view/intake-view.component';

const routes: Routes = [
  { path: '', component: IntakeListComponent },
  { path: 'create', component: IntakeCreateComponent },
  { path: 'edit/:id', component: IntakeEditComponent },
  { path: 'view/:id', component: IntakeViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErIntakesRoutingModule { }
