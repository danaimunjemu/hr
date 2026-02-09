import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeRelationsPageComponent } from './pages/employee-relations-page/employee-relations-page.component';

const routes: Routes = [
  { path: '', component: EmployeeRelationsPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRelationsRoutingModule { }
