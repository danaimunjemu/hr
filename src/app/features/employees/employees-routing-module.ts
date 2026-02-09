import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllEmployees } from './pages/all-employees/all-employees';
import { ViewEmployee } from './pages/view-employee/view-employee';
import { EditEmployee } from './pages/edit-employee/edit-employee';
import { NewEmployee } from './pages/new-employee/new-employee';

const routes: Routes = [
  { path: '', component: AllEmployees },
  { path: 'new', component: NewEmployee },
  { path: 'view/:id', component: ViewEmployee },
  { path: 'edit/:id', component: EditEmployee }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeesRoutingModule { }
