import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing-module';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { SharedModule } from '../../shared/shared-module';
import { ReportsPageComponent } from './pages/reports-page/reports-page.component';


@NgModule({
  declarations: [
    ReportsPageComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    AntDesignModules,
    SharedModule
  ]
})
export class ReportsModule { }
