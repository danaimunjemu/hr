export interface KpiCard {
  label: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    value: number; // percentage change
    direction: 'up' | 'down' | 'neutral';
  };
  severity: 'neutral' | 'info' | 'success' | 'warning' | 'critical';
}

export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string; // For stacked charts
}

export interface OhsMetrics {
  kpis: {
    safetyIncidents: KpiCard;
    openInvestigations: KpiCard;
    highSeverityIncidents: KpiCard;
    daysLost: KpiCard;
    nearMisses: KpiCard;
    medicalSurveillanceDue: KpiCard;
    unfitEmployees: KpiCard;
    correctiveActionsPending: KpiCard;
  };
  charts: {
    incidentsByType: ChartDataPoint[];
    incidentTrend: ChartDataPoint[];
    investigationStatus: ChartDataPoint[];
    nearMissSeverity: ChartDataPoint[];
  };
}

export interface ErMetrics {
  kpis: {
    activeCases: KpiCard;
    casesAtRisk: KpiCard;
    openTasks: KpiCard;
    overdueTasks: KpiCard;
  };
  charts: {
    casesByStage: ChartDataPoint[];
    caseVolumeByDept: ChartDataPoint[];
    casePriority: ChartDataPoint[];
    tasksByAssignee: ChartDataPoint[];
  };
}

export interface TimeLeaveMetrics {
  kpis: {
    pendingLeaveRequests: KpiCard;
    employeesOnLeave: KpiCard;
    pendingTimesheets: KpiCard;
    totalOvertimeHours: KpiCard;
  };
  charts: {
    leaveTypeDistribution: ChartDataPoint[];
    overtimeTrend: ChartDataPoint[];
    leaveStatusOverview: ChartDataPoint[];
  };
}

export interface WorkforceMetrics {
  kpis: {
    totalHeadcount: KpiCard;
    newHires: KpiCard;
    terminations: KpiCard;
    genderDiversity: KpiCard;
  };
  charts: {
    headcountByDept: ChartDataPoint[];
    employmentTypeSplit: ChartDataPoint[];
    tenureDistribution: ChartDataPoint[];
  };
}

export interface DashboardData {
  ohs: OhsMetrics;
  er: ErMetrics;
  timeLeave: TimeLeaveMetrics;
  workforce: WorkforceMetrics;
}
