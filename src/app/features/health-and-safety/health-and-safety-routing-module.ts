import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HealthAndSafetyPageComponent } from './pages/health-and-safety-page/health-and-safety-page.component';

const routes: Routes = [
  { path: '', component: HealthAndSafetyPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HealthAndSafetyRoutingModule { }
