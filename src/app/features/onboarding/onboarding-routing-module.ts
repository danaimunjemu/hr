import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnboardingPageComponent } from './pages/onboarding-page/onboarding-page.component';
import { BatchDetail } from './pages/bulk-onboarding/batch-detail/batch-detail';
import { BatchList } from './pages/bulk-onboarding/batch-list/batch-list';
import { BulkOnboarding } from './pages/bulk-onboarding/bulk-onboarding';



const routes: Routes = [
  { path: '', component: OnboardingPageComponent },

  // batches
  { path: 'batches', component: BatchList },
  { path: 'batches/new', component: BulkOnboarding },
  { path: 'batches/:id', component: BatchDetail },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModule {}
