import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TimeAndLeaveUserRoutingModule } from './time-and-leave-user-routing-module';
import { AntDesignModules } from '../../../core/modules/antdesign.module';
import { TimeAndLeaveUserPageComponent } from './pages/time-and-leave-user-page/time-and-leave-user-page';
import { TimesheetSubmissionComponent } from './pages/timesheet-submission/timesheet-submission.component';
import { LeaveRequestsComponent } from './pages/leave-requests/leave-requests.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { ScheduleChecklistComponent } from './components/schedule-checklist/schedule-checklist.component';

@NgModule({
  declarations: [
    TimeAndLeaveUserPageComponent,
    TimesheetSubmissionComponent,
    LeaveRequestsComponent,
    ReportsComponent,
    ScheduleChecklistComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TimeAndLeaveUserRoutingModule,
    AntDesignModules
  ]
})
export class TimeAndLeaveUserModule { }
