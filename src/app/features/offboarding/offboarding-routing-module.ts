import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OffboardingListPageComponent } from './pages/offboarding-list-page/offboarding-list-page.component';
import { OffboardingCreatePageComponent } from './pages/offboarding-create-page/offboarding-create-page.component';
import { OffboardingDetailsPageComponent } from './pages/offboarding-details-page/offboarding-details-page.component';
import { OffboardingEditPageComponent } from './pages/offboarding-edit-page/offboarding-edit-page.component';
import { Organo } from './pages/organo/organo';

const routes: Routes = [
  { path: '', component: OffboardingListPageComponent },
  { path: 'new', component: OffboardingCreatePageComponent },
  { path: ':id/edit', component: OffboardingEditPageComponent },
  { path: ':id', component: OffboardingDetailsPageComponent },
  { path: 'organo', component: Organo }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OffboardingRoutingModule {}
