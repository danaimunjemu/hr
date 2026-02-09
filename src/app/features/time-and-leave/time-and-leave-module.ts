import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { TimeAndLeaveRoutingModule } from './time-and-leave-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { AntDesignModules } from '../../core/modules/antdesign.module';

import { TimeAndLeaveSettingsPageComponent } from './pages/time-and-leave-settings-page/time-and-leave-settings-page';
import { WorkContractListComponent } from './pages/work-contract/work-contract-list/work-contract-list';
import { WorkContractFormComponent } from './pages/work-contract/work-contract-form/work-contract-form';
import { WorkContractViewComponent } from './pages/work-contract/work-contract-view/work-contract-view';
import { WeekendRuleListComponent } from './pages/weekend-rule/weekend-rule-list/weekend-rule-list';
import { WeekendRuleFormComponent } from './pages/weekend-rule/weekend-rule-form/weekend-rule-form';
import { WeekendRuleViewComponent } from './pages/weekend-rule/weekend-rule-view/weekend-rule-view';
import { WorkScheduleRuleListComponent } from './pages/work-schedule-rule/work-schedule-rule-list/work-schedule-rule-list';
import { WorkScheduleRuleFormComponent } from './pages/work-schedule-rule/work-schedule-rule-form/work-schedule-rule-form';
import { WorkScheduleRuleViewComponent } from './pages/work-schedule-rule/work-schedule-rule-view/work-schedule-rule-view';
import { ShiftDefinitionListComponent } from './pages/shift-definition/shift-definition-list/shift-definition-list';
import { ShiftDefinitionFormComponent } from './pages/shift-definition/shift-definition-form/shift-definition-form';
import { ShiftDefinitionViewComponent } from './pages/shift-definition/shift-definition-view/shift-definition-view';
import { EmployeeGroupListComponent } from './pages/employee-group/employee-group-list/employee-group-list';
import { EmployeeGroupFormComponent } from './pages/employee-group/employee-group-form/employee-group-form';
import { EmployeeGroupViewComponent } from './pages/employee-group/employee-group-view/employee-group-view';
import { GroupScheduleRuleListComponent } from './pages/group-schedule-rule/group-schedule-rule-list/group-schedule-rule-list';
import { GroupScheduleRuleFormComponent } from './pages/group-schedule-rule/group-schedule-rule-form/group-schedule-rule-form';
import { GroupScheduleRuleViewComponent } from './pages/group-schedule-rule/group-schedule-rule-view/group-schedule-rule-view';
import { EmployeeScheduleOverrideListComponent } from './pages/employee-schedule-override/employee-schedule-override-list/employee-schedule-override-list';
import { EmployeeScheduleOverrideFormComponent } from './pages/employee-schedule-override/employee-schedule-override-form/employee-schedule-override-form';
import { EmployeeScheduleOverrideViewComponent } from './pages/employee-schedule-override/employee-schedule-override-view/employee-schedule-override-view';
import { HolidayCalendarListComponent } from './pages/holiday-calendar/holiday-calendar-list/holiday-calendar-list';
import { HolidayCalendarFormComponent } from './pages/holiday-calendar/holiday-calendar-form/holiday-calendar-form';
import { HolidayCalendarViewComponent } from './pages/holiday-calendar/holiday-calendar-view/holiday-calendar-view';
import { LeaveTypeListComponent } from './pages/leave/leave-type-list/leave-type-list';
import { LeaveTypeFormComponent } from './pages/leave/leave-type-form/leave-type-form';
import { LeaveTypeViewComponent } from './pages/leave/leave-type-view/leave-type-view';
import { OvertimeRuleListComponent } from './pages/overtime-rule/overtime-rule-list/overtime-rule-list';
import { OvertimeRuleFormComponent } from './pages/overtime-rule/overtime-rule-form/overtime-rule-form';
import { OvertimeRuleViewComponent } from './pages/overtime-rule/overtime-rule-view/overtime-rule-view';
import { ShiftAssignmentComponent } from './pages/shift-assignment/shift-assignment';
import { ScheduleExceptionListComponent } from './pages/schedule-exception/schedule-exception-list/schedule-exception-list';
import { ScheduleExceptionFormComponent } from './pages/schedule-exception/schedule-exception-form/schedule-exception-form';
import { ScheduleExceptionViewComponent } from './pages/schedule-exception/schedule-exception-view/schedule-exception-view';

import { TimesheetComponent } from './pages/timesheet/timesheet';

@NgModule({
  declarations: [
    TimeAndLeaveSettingsPageComponent,
    WorkContractListComponent,
    WorkContractFormComponent,
    WorkContractViewComponent,
    WeekendRuleListComponent,
    WeekendRuleFormComponent,
    WeekendRuleViewComponent,
    WorkScheduleRuleListComponent,
    WorkScheduleRuleFormComponent,
    WorkScheduleRuleViewComponent,
    ShiftDefinitionListComponent,
    ShiftDefinitionFormComponent,
    ShiftDefinitionViewComponent,
    EmployeeGroupListComponent,
    EmployeeGroupFormComponent,
    EmployeeGroupViewComponent,
    GroupScheduleRuleListComponent,
    GroupScheduleRuleFormComponent,
    GroupScheduleRuleViewComponent,
    EmployeeScheduleOverrideListComponent,
    EmployeeScheduleOverrideFormComponent,
    EmployeeScheduleOverrideViewComponent,
    ShiftAssignmentComponent,
    OvertimeRuleListComponent,
    OvertimeRuleFormComponent,
    OvertimeRuleViewComponent,
    HolidayCalendarListComponent,
    HolidayCalendarFormComponent,
    HolidayCalendarViewComponent,
    ScheduleExceptionListComponent,
    ScheduleExceptionFormComponent,
    ScheduleExceptionViewComponent,

    TimesheetComponent,
    LeaveTypeListComponent,
    LeaveTypeFormComponent,
    LeaveTypeViewComponent,

  ],
  imports: [
    CommonModule,
    TimeAndLeaveRoutingModule,
    AntDesignModules,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NzTabsModule,
    RouterModule,
    RouterLink
  ]
})
export class TimeAndLeaveModule { }
