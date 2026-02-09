import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimeAndLeaveUserPageComponent } from './pages/time-and-leave-user-page/time-and-leave-user-page';
import { TimesheetSubmissionComponent } from './pages/timesheet-submission/timesheet-submission.component';
import { LeaveRequestsComponent } from './pages/leave-requests/leave-requests.component';
import { ReportsComponent } from './pages/reports/reports.component';

const routes: Routes = [
  {
    path: '',
    component: TimeAndLeaveUserPageComponent,
    children: [
      { path: '', redirectTo: 'timesheet-submission', pathMatch: 'full' },
      { path: 'timesheet-submission', component: TimesheetSubmissionComponent },
      { path: 'leave-requests', component: LeaveRequestsComponent },
      { path: 'reports', component: ReportsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimeAndLeaveUserRoutingModule { }
