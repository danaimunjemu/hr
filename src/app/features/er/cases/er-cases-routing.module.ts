import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaseListComponent } from './pages/case-list/case-list.component';
import { CaseEditComponent } from './pages/case-edit/case-edit.component';
import { CaseViewComponent } from './pages/case-view/case-view.component';
import { CaseCreateProcessComponent } from '../process/components/case-create-process/case-create-process.component';

const routes: Routes = [
  { path: '', component: CaseListComponent },
  { path: 'create', component: CaseCreateProcessComponent },
  { path: 'edit/:id', component: CaseEditComponent },
  { path: 'view/:id', component: CaseViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErCasesRoutingModule { }
