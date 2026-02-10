import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OutcomeListComponent } from './pages/outcome-list/outcome-list.component';
import { OutcomeCreateComponent } from './pages/outcome-create/outcome-create.component';
import { OutcomeEditComponent } from './pages/outcome-edit/outcome-edit.component';
import { OutcomeViewComponent } from './pages/outcome-view/outcome-view.component';

const routes: Routes = [
  { path: '', component: OutcomeListComponent },
  { path: 'create', component: OutcomeCreateComponent },
  { path: 'edit/:id', component: OutcomeEditComponent },
  { path: 'view/:id', component: OutcomeViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErOutcomesRoutingModule { }
