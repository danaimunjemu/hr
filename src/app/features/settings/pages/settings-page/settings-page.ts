import { Component } from '@angular/core';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-settings-page',
  standalone: false,
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss'
})
export class SettingsPage {
  isCollapsed = false;

  menuItems: MenuItem[] = [
    { title: 'Company', icon: 'bank', route: '/app/settings/companies' },
    { title: 'Cost Center', icon: 'audit', route: '/app/settings/cost-centers' },
    { title: 'Employee Group', icon: 'team', route: '/app/settings/employee-groups' },
    { title: 'Employee Sub Group', icon: 'usergroup-add', route: '/app/settings/employee-sub-groups' },
    { title: 'Ethnic Group', icon: 'global', route: '/app/settings/ethnic-groups' },
    { title: 'Grade', icon: 'star', route: '/app/settings/grades' },
    { title: 'Job Description', icon: 'file-text', route: '/app/settings/job-descriptions' },
    { title: 'Organizational Unit', icon: 'cluster', route: '/app/settings/organizational-units' },
    { title: 'Personnel Area', icon: 'environment', route: '/app/settings/personnel-areas' },
    { title: 'Personnel Sub Area', icon: 'shop', route: '/app/settings/personnel-sub-areas' },
    { title: 'Position', icon: 'idcard', route: '/app/settings/positions' },
    { title: 'PS Group', icon: 'group', route: '/app/settings/ps-groups' },
    { title: 'Work Contract', icon: 'file-protect', route: '/app/settings/work-contracts' },
    { title: 'Work Schedule Rule', icon: 'schedule', route: '/app/settings/work-schedule-rules' },
  ];
}
