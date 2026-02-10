import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OhsShellComponent } from './pages/ohs-shell/ohs-shell.component';
import { HealthAndSafetyPageComponent } from './pages/health-and-safety-page/health-and-safety-page.component';
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

const routes: Routes = [
  {
    path: '',
    component: OhsShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: HealthAndSafetyPageComponent },
      { path: 'incidents', component: SafetyIncidentListComponent },
      { path: 'incidents/create', component: SafetyIncidentFormComponent },
      { path: 'incidents/view/:id', component: SafetyIncidentFormComponent },
      { path: 'near-misses', component: NearMissListComponent },
      { path: 'near-misses/create', component: NearMissFormComponent },
      { path: 'near-misses/view/:id', component: NearMissFormComponent },
      { path: 'medical', component: MedicalSurveillanceListComponent },
      { path: 'medical/create', component: MedicalSurveillanceFormComponent },
      { path: 'medical/view/:id', component: MedicalSurveillanceFormComponent },
      { path: 'inductions', component: InductionListComponent },
      { path: 'inductions/create', component: InductionFormComponent },
      { path: 'inductions/edit/:id', component: InductionFormComponent },
      { path: 'corrective-actions', component: CorrectiveActionListComponent },
      { path: 'corrective-actions/create', component: CorrectiveActionFormComponent },
      { path: 'corrective-actions/edit/:id', component: CorrectiveActionFormComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HealthAndSafetyRoutingModule { }
