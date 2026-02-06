import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing-module';
import {SharedModule} from '../../shared/shared-module';
import {AntDesignModules} from '../../core/modules/antdesign.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Dashboard } from './pages/dashboard/dashboard';


@NgModule({
  declarations: [
    Dashboard
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    AntDesignModules,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class DashboardModule { }
