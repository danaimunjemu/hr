// Force rebuild
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { EmployeesRoutingModule } from './employees-routing-module';
import { AllEmployees } from './pages/all-employees/all-employees';
import { ViewEmployee } from './pages/view-employee/view-employee';
import { EditEmployee } from './pages/edit-employee/edit-employee';
import { NewEmployee } from './pages/new-employee/new-employee';
import { EmployeeAssets } from './pages/employee-assets/employee-assets';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { ErModule } from '../er/er.module';


@NgModule({
  declarations: [
    AllEmployees,
    ViewEmployee,
    EditEmployee,
    NewEmployee,
    EmployeeAssets
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EmployeesRoutingModule,
    AntDesignModules,
    ErModule
  ]
})
export class EmployeesModule { }
