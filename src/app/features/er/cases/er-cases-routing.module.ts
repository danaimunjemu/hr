import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaseListComponent } from './pages/case-list/case-list.component';
import { CaseCreateComponent } from './pages/case-create/case-create.component';
import { CaseEditComponent } from './pages/case-edit/case-edit.component';
import { CaseViewComponent } from './pages/case-view/case-view.component';

const routes: Routes = [
  { path: '', component: CaseListComponent },
  { path: 'create', component: CaseCreateComponent },
  { path: 'edit/:id', component: CaseEditComponent },
  { path: 'view/:id', component: CaseViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErCasesRoutingModule { }
