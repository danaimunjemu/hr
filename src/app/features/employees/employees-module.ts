// Force rebuild
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { EmployeesRoutingModule } from './employees-routing-module';
import { AllEmployees } from './pages/all-employees/all-employees';
import { ViewEmployee } from './pages/view-employee/view-employee';
import { EditEmployee } from './pages/edit-employee/edit-employee';
import { NewEmployee } from './pages/new-employee/new-employee';
import { AntDesignModules } from '../../core/modules/antdesign.module';


@NgModule({
  declarations: [
    AllEmployees,
    ViewEmployee,
    EditEmployee,
    NewEmployee
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EmployeesRoutingModule,
    AntDesignModules
  ]
})
export class EmployeesModule { }
