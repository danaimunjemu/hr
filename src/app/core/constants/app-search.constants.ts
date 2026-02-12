export interface AppSearchItem {
  name: string;
  path: string;
  description: string;
  keywords?: string[];
}

export const APP_SEARCH_ITEMS: AppSearchItem[] = [
  {
    name: 'Dashboard',
    path: '/app/dashboard',
    description: 'View HR overview metrics and quick summaries.',
    keywords: ['home', 'overview', 'main'],
  },
  {
    name: 'Employees',
    path: '/app/employees',
    description: 'Manage employee profiles and employee records.',
    keywords: ['staff', 'people', 'employee list'],
  },
  {
    name: 'Onboarding',
    path: '/app/onboarding',
    description: 'Track onboarding tasks and new hire progress.',
    keywords: ['new hire', 'orientation', 'induction'],
  },
  {
    name: 'My Time and Leave',
    path: '/app/time-and-leave-user',
    description: 'Submit timesheets and leave requests as an employee.',
    keywords: ['timesheet', 'leave', 'attendance'],
  },
  {
    name: 'Performance (User)',
    path: '/app/performance-user',
    description: 'Manage appraisals and user performance activities.',
    keywords: ['goals', 'reviews', 'appraisal'],
  },
  {
    name: 'Health and Safety',
    path: '/app/health-and-safety',
    description: 'Manage incidents, near misses, and medical surveillance.',
    keywords: ['incident', 'near miss', 'medical', 'safety'],
  },
  {
    name: 'Employee Relations',
    path: '/app/employee-relations',
    description: 'Access employee relations cases and workflows.',
    keywords: ['er', 'cases', 'relations'],
  },
  {
    name: 'Chatbot',
    path: '/app/chatbot',
    description: 'Use AI assistant features within HR workflows.',
    keywords: ['assistant', 'ai', 'chat'],
  },
  {
    name: 'Employee Master Data',
    path: '/app/settings',
    description: 'Configure companies, org units, grades, and master data.',
    keywords: ['settings', 'master', 'configuration'],
  },
  {
    name: 'Time and Leave Setup',
    path: '/app/time-and-leave',
    description: 'Configure leave types, overtime rules, and timesheet setup.',
    keywords: ['leave setup', 'overtime', 'rules'],
  },
  {
    name: 'Performance Setup',
    path: '/app/performance',
    description: 'Configure performance templates, cycles, and settings.',
    keywords: ['performance settings', 'templates', 'cycles'],
  },
];
