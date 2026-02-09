import { Component } from '@angular/core';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-time-and-leave-user-page',
  standalone: false,
  templateUrl: './time-and-leave-user-page.html',
  styleUrls: ['./time-and-leave-user-page.scss']
})
export class TimeAndLeaveUserPageComponent {
  isCollapsed = false;

  menuItems: MenuItem[] = [
    { title: 'Timesheet Submission', icon: 'clock-circle', route: '/app/time-and-leave-user/timesheet-submission' },
    { title: 'Leave Requests', icon: 'rest', route: '/app/time-and-leave-user/leave-requests' },
    { title: 'Reports', icon: 'file-text', route: '/app/time-and-leave-user/reports' }
  ];
}
