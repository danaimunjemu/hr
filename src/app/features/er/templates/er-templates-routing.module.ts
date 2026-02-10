import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateListComponent } from './pages/template-list/template-list.component';
import { TemplateCreateComponent } from './pages/template-create/template-create.component';
import { TemplateEditComponent } from './pages/template-edit/template-edit.component';
import { TemplateViewComponent } from './pages/template-view/template-view.component';

const routes: Routes = [
  { path: '', component: TemplateListComponent },
  { path: 'create', component: TemplateCreateComponent },
  { path: 'edit/:id', component: TemplateEditComponent },
  { path: 'view/:id', component: TemplateViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErTemplatesRoutingModule { }
