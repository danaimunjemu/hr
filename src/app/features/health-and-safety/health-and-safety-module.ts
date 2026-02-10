import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { HealthAndSafetyRoutingModule } from './health-and-safety-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { HealthAndSafetyPageComponent } from './pages/health-and-safety-page/health-and-safety-page.component';
import { OhsShellComponent } from './pages/ohs-shell/ohs-shell.component';
import { SafetyIncidentListComponent } from './pages/safety-incidents/safety-incident-list.component';
import { SafetyIncidentFormComponent } from './pages/safety-incidents/safety-incident-form.component';
import { NearMissListComponent } from './pages/near-misses/near-miss-list.component';
import { NearMissFormComponent } from './pages/near-misses/near-miss-form.component';
import { MedicalSurveillanceListComponent } from './pages/medical-surveillance/medical-surveillance-list.component';
import { MedicalSurveillanceFormComponent } from './pages/medical-surveillance/medical-surveillance-form.component';
import { InductionListComponent } from './pages/inductions/induction-list.component';
import { InductionFormComponent } from './pages/inductions/induction-form.component';
import { CorrectiveActionListComponent } from './pages/corrective-actions/corrective-action-list.component';
import { CorrectiveActionFormComponent } from './pages/corrective-actions/corrective-action-form.component';

@NgModule({
  declarations: [
    HealthAndSafetyPageComponent,
    OhsShellComponent,
    SafetyIncidentListComponent,
    SafetyIncidentFormComponent,
    NearMissListComponent,
    NearMissFormComponent,
    MedicalSurveillanceListComponent,
    MedicalSurveillanceFormComponent,
    InductionListComponent,
    InductionFormComponent,
    CorrectiveActionListComponent,
    CorrectiveActionFormComponent
  ],
  imports: [
    CommonModule,
    HealthAndSafetyRoutingModule,
    AntDesignModules,
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class HealthAndSafetyModule { }
