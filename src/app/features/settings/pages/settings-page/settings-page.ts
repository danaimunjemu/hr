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



  menuItems = {
    organisationalStructure: [
      { title: 'Company', icon: 'bank', route: '/app/settings/master-data/companies' },
      { title: 'Organizational Unit', icon: 'deployment-unit', route: '/app/settings/master-data/organizational-units' },
      { title: 'Personnel Area', icon: 'environment', route: '/app/settings/master-data/personnel-areas' },
      { title: 'Personnel Sub Area', icon: 'shop', route: '/app/settings/master-data/personnel-sub-areas' }
    ],

    employmentStructure: [
      { title: 'Employee Group', icon: 'team', route: '/app/settings/master-data/employee-groups' },
      { title: 'Employee Sub Group', icon: 'usergroup-add', route: '/app/settings/master-data/employee-sub-groups' },
      { title: 'Work Contract', icon: 'file-protect', route: '/app/settings/master-data/work-contracts' },
      { title: 'Work Schedule Rule', icon: 'schedule', route: '/app/settings/master-data/work-schedule-rules' }
    ],

    compensationAndClassification: [
      { title: 'Ethnic Group', icon: 'global', route: '/app/settings/master-data/ethnic-groups' },
      { title: 'Grade', icon: 'star', route: '/app/settings/master-data/grades' },
      { title: 'Pay Scale Group', icon: 'group', route: '/app/settings/master-data/ps-groups' },
      { title: 'Cost Center', icon: 'audit', route: '/app/settings/master-data/cost-centers' }
    ],

    jobAndRole: [
      { title: 'Position', icon: 'idcard', route: '/app/settings/master-data/positions' },
      { title: 'Job Description', icon: 'file-text', route: '/app/settings/master-data/job-descriptions' }
    ]
  };
}
