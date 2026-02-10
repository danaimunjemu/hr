import { Component, signal } from '@angular/core';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-time-and-leave-settings-page',
  standalone: false,
  templateUrl: './time-and-leave-settings-page.html',
  styleUrl: './time-and-leave-settings-page.scss'
})
export class TimeAndLeaveSettingsPageComponent {
  isCollapsed = signal(false);

  menuItems = signal<MenuItem[]>([
    { title: 'Work Contract', icon: 'file-protect', route: '/app/time-and-leave/work-contract' },
    { title: 'Overtime Rule', icon: 'percentage', route: '/app/time-and-leave/overtime-rule' },
    { title: 'Work Schedule Rule', icon: 'schedule', route: '/app/time-and-leave/work-schedule-rule' },
    { title: 'Shift Definition', icon: 'clock-circle', route: '/app/time-and-leave/shift-definition' },
    { title: 'Shift Assignment', icon: 'usergroup-add', route: '/app/time-and-leave/shift-assignment' },
    { title: 'Weekend Rule', icon: 'calendar', route: '/app/time-and-leave/weekend-rule' },
    { title: 'Holiday Calendar', icon: 'calendar', route: '/app/time-and-leave/holiday-calendar' },
    { title: 'Employee Group', icon: 'team', route: '/app/time-and-leave/employee-group' },
    { title: 'Group Schedule Rule', icon: 'team', route: '/app/time-and-leave/group-schedule-rule' },
    { title: 'Employee Schedule Override', icon: 'user', route: '/app/time-and-leave/employee-schedule-override' },
    { title: 'Schedule Exception', icon: 'exclamation-circle', route: '/app/time-and-leave/schedule-exception' },
    { title: 'Timesheet', icon: 'table', route: '/app/time-and-leave/timesheet' },
    { title: 'Leave Types & Requests', icon: 'rest', route: '/app/time-and-leave/leave' }
  ]);
}
