import { Component } from '@angular/core';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-performance-user-page',
  standalone: false,
  templateUrl: './performance-user-page.html',
  styleUrls: ['./performance-user-page.scss']
})
export class PerformanceUserPageComponent {
  isCollapsed = false;

  menuItems: MenuItem[] = [
    { title: 'My Appraisals', icon: 'star', route: '/app/performance-user/appraisals' },
    { title: 'Give Feedback', icon: 'message', route: '/app/performance-user/reviews' },
    { title: '360 Feedback', icon: 'comment', route: '/app/performance-user/reviews-feedback' },
    { title: 'My Team Appraisal', icon: 'team', route: '/app/performance-user/team-appraisals' }
  ];
}
