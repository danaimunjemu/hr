import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OnboardingRoutingModule } from './onboarding-routing-module';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { SharedModule } from '../../shared/shared-module';
import { OnboardingPageComponent } from './pages/onboarding-page/onboarding-page.component';


@NgModule({
  declarations: [
    OnboardingPageComponent
  ],
  imports: [
    CommonModule,
    OnboardingRoutingModule,
    AntDesignModules,
    SharedModule
  ]
})
export class OnboardingModule { }
