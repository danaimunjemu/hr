export interface AppSearchItem {
  name: string;
  path: string;
  description: string;
}

export const APP_SEARCH_ITEMS: AppSearchItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard/main',
    description: 'View overall ESG performance insights, key metrics, and progress toward sustainability goals.'
  },
  {
    name: 'Condensed Report',
    path: '/reports/all/condensed',
    description: 'Access a summarized ESG report highlighting key performance indicators and compliance status.'
  },
  {
    name: 'Detailed Report',
    path: '/reports/all/detailed',
    description: 'Explore comprehensive ESG data and analytics for all factors, subcategories, and reporting periods.'
  },
  {
    name: 'Emissions Report',
    path: '/reports/all/emissions',
    description: 'Analyze greenhouse gas emissions data, trends, and performance against reduction targets.'
  },
  {
    name: 'Trend Analysis Report',
    path: '/reports/all/trend-analysis',
    description: 'Visualize ESG performance trends over time to track improvements and identify areas for action.'
  },
  {
    name: 'Anomalies Report',
    path: '/reports/all/anomalies',
    description: 'Detect irregularities or deviations in ESG data, helping ensure accuracy and data integrity.'
  },
  {
    name: 'Audit Report',
    path: '/reports/all/audit',
    description: 'Review a historical audit trail of ESG submissions, target adjustments, and user activity logs.'
  },
  {
    name: 'Yearly Targets',
    path: '/data/all/yearly-targets',
    description: 'Set and monitor annual ESG targets for various categories such as environment, social, and governance.'
  },
  {
    name: 'Reporting Data',
    path: '/data/all/reporting-data',
    description: 'Manage ESG reporting data inputs and validate factor-level information across departments.'
  },
  {
    name: 'Actuals',
    path: '/data/all/actuals',
    description: 'Capture and verify actual ESG performance metrics against established yearly targets.'
  },
  {
    name: 'User Management',
    path: '/reports/user-management',
    description: 'Administer system users, assign ESG-related roles, and control access to reporting features.'
  },
  {
    name: 'Frameworks Library',
    path: '/esg-analysis/library',
    description: 'Browse and manage ESG frameworks, indicators, and scoring methodologies used in assessments.'
  },
  {
    name: 'Commentaries',
    path: '/esg-analysis/commentaries',
    description: 'View and add qualitative commentaries and explanations supporting ESG data submissions.'
  },
  {
    name: 'User Profile',
    path: '/profile/user/details',
    description: 'Manage personal information, preferences, and organization-level ESG user settings.'
  },
];
