import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { DashboardService } from './services/dashboard.service';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    AntDesignModules,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    DashboardService
  ]
})
export class DashboardModule { }
