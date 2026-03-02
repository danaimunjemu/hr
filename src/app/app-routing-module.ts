// Force router rebuild
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayout } from './shared/components/layout/main-layout/main-layout';
import { NotFound } from './core/pages/not-found/not-found';
import { ErWorkspaceComponent } from './features/er/er-workspace/er-workspace.component';

const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/authentication/authentication-module').then((m) => m.AuthenticationModule),
    canActivate: [],
  },
  {
    path: 'app',
    component: MainLayout,
    canActivate: [],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard-module').then((m) => m.DashboardModule),
        canActivate: [],
      },
      {
        path: 'employees',
        loadChildren: () =>
          import('./features/employees/employees-module').then((m) => m.EmployeesModule),
        canActivate: [],
      },
      {
        path: 'organogram',
        loadChildren: () =>
          import('./modules/organogram/organogram.module').then((m) => m.OrganogramModule),
        canActivate: [],
      },
      {
        path: 'organogram-v2',
        loadChildren: () =>
          import('./modules/organogram-v2/organogram-v2.module').then((m) => m.OrganogramV2Module),
        canActivate: [],
      },
      {
        path: 'onboarding',
        loadChildren: () =>
          import('./features/onboarding/onboarding-module').then((m) => m.OnboardingModule),
        canActivate: [],
      },
      {
        path: 'offboarding',
        loadChildren: () =>
          import('./features/offboarding/offboarding-module').then((m) => m.OffboardingModule),
        canActivate: [],
      },
      {
        path: 'offboarding-v2',
        loadChildren: () =>
          import('./modules/offboarding-v2/offboarding-v2.module').then((m) => m.OffboardingV2Module),
        canActivate: [],
      },
      // {
      //   path: 'time-and-leave',
      //   loadChildren: () =>
      //     import('./features/time-and-leave/time-and-leave-module').then((m) => m.TimeAndLeaveModule),
      //   canActivate: [],
      // },
      {
        path: 'time-and-leave-user',
        loadChildren: () =>
          import('./features/user/time-and-leave-user/time-and-leave-user-module').then((m) => m.TimeAndLeaveUserModule),
        canActivate: [],
      },
      {
        path: 'performance-user',
        loadChildren: () =>
          import('./features/user/performance-user/performance-user-module').then((m) => m.PerformanceUserModule),
        canActivate: [],
      },
      {
        path: 'health-and-safety',
        loadChildren: () =>
          import('./features/health-and-safety/health-and-safety-module').then((m) => m.HealthAndSafetyModule),
        canActivate: [],
      },
      {
        path: 'employee-relations',
        loadChildren: () => import('./features/er/er.module').then(m => m.ErModule)
      },
      {
        path: 'training-and-skills',
        loadChildren: () =>
          import('./features/training-and-skills/training-and-skills-module').then((m) => m.TrainingAndSkillsModule),
        canActivate: [],
      },
      {
        path: 'recruitment',
        loadChildren: () =>
          import('./features/recruitment/recruitment-module').then((m) => m.RecruitmentModule),
        canActivate: [],
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports-module').then((m) => m.ReportsModule),
        canActivate: [],
      },
      {
        path: 'chatbot',
        loadChildren: () => import('./features/chatbot/chatbot.module').then(m => m.ChatbotModule)
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings-module').then((m) => m.SettingsModule),
        canActivate: [],
      },
      {
        path: 'payroll',
        loadChildren: () => import('./features/payroll/payroll.module').then(m => m.PayrollModule)
      },
      // {
      //   path: 'performance',
      //   loadChildren: () =>
      //     import('./features/performance/performance-module').then((m) => m.PerformanceModule),
      //   canActivate: [],
      // }
    ],
  },
  { path: '**', component: NotFound },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


