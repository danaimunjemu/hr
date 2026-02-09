import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HealthAndSafetyRoutingModule } from './health-and-safety-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { HealthAndSafetyPageComponent } from './pages/health-and-safety-page/health-and-safety-page.component';


@NgModule({
  declarations: [
    HealthAndSafetyPageComponent
  ],
  imports: [
    CommonModule,
    HealthAndSafetyRoutingModule,
    AntDesignModules,
    SharedModule
  ]
})
export class HealthAndSafetyModule { }
