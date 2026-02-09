import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeRelationsRoutingModule } from './employee-relations-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { EmployeeRelationsPageComponent } from './pages/employee-relations-page/employee-relations-page.component';


@NgModule({
  declarations: [
    EmployeeRelationsPageComponent
  ],
  imports: [
    CommonModule,
    EmployeeRelationsRoutingModule,
    AntDesignModules,
    SharedModule
  ]
})
export class EmployeeRelationsModule { }
