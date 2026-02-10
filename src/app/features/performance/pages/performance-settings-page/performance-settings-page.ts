import { Component } from '@angular/core';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-performance-settings-page',
  standalone: false,
  templateUrl: './performance-settings-page.html',
  styleUrl: './performance-settings-page.scss'
})
export class PerformanceSettingsPageComponent {
  isCollapsed = false;

  menuItems: MenuItem[] = [
    { title: 'Performance Cycle', icon: 'calendar', route: '/app/performance/performance-cycle' },
    { title: 'Goal Template', icon: 'file-protect', route: '/app/performance/goal-template' },
    { title: 'Goal Settings', icon: 'setting', route: '/app/performance/goal-settings' },
    { title: '360 Setup', icon: 'team', route: '/app/performance/review-360-setup' }
  ];
}
