import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, signal, effect } from '@angular/core';
import { Chart } from '@antv/g2';
import { finalize } from 'rxjs';

// Services (Keep for top cards only)
import { EmployeesService, Employee } from '../../../employees/services/employees.service';
import { OhsService } from '../../../health-and-safety/services/ohs.service';
import { ErCaseService } from '../../../er/cases/services/er-case.service';
import { SafetyIncident } from '../../../health-and-safety/models/ohs.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  // Data Signals
  totalEmployees = signal<number>(0);
  safetyIncidentsCount = signal<number>(0);
  erCasesCount = signal<number>(0);

  employeesList = signal<Employee[]>([]);
  incidentsList = signal<SafetyIncident[]>([]);

  // Loading State
  loading = signal<boolean>(true);

  // Chart References
  @ViewChild('heatmapContainer') heatmapContainer!: ElementRef;
  @ViewChild('barContainer') barContainer!: ElementRef;
  @ViewChild('donutContainer') donutContainer!: ElementRef;
  @ViewChild('lineContainer') lineContainer!: ElementRef;

  // Table Data
  recentActivities: any[] = [];
  upcomingEvents = [
    { title: 'Fire Safety Induction', type: 'Training', date: '2026-02-10' },
    { title: 'Annual Medical Checkup', type: 'Health', date: '2026-02-12' },
    { title: 'Performance Review Cycle', type: 'HR', date: '2026-02-15' },
    { title: 'New Hire Orientation', type: 'Onboarding', date: '2026-02-20' }
  ];

  constructor(
    private employeesService: EmployeesService,
    private ohsService: OhsService,
    private erCaseService: ErCaseService
  ) {
    // Watch for loading state change to render charts
    effect(() => {
      if (!this.loading()) {
        // Wait for DOM update (due to *ngIf) then render charts
        setTimeout(() => {
          this.renderEmploymentStatusChart();
          this.renderOhsIncidentsChart();
          this.renderTrendsChart();
          this.renderTimeAttendanceHeatmap();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    this.fetchTopCardsData();
  }

  private fetchTopCardsData(): void {
    this.loading.set(true);

    let completed = 0;
    const checkDone = () => {
      completed++;
      if (completed >= 3) {
        this.populateRecentActivities();
        this.loading.set(false);
      }
    };

    // 1. Employees
    this.employeesService.getEmployees()
      .pipe(finalize(() => checkDone()))
      .subscribe({
        next: (data) => {
          this.employeesList.set(data);
          this.totalEmployees.set(data.length);
        },
        error: (err) => console.error('Failed to fetch employees', err)
      });

    // 2. Safety Incidents
    this.ohsService.getSafetyIncidents()
      .pipe(finalize(() => checkDone()))
      .subscribe({
        next: (data) => {
          this.incidentsList.set(data);
          this.safetyIncidentsCount.set(data.length);
        },
        error: (err) => console.error('Failed to fetch incidents', err)
      });

    // 3. ER Cases
    this.erCaseService.getCases()
      .pipe(finalize(() => checkDone()))
      .subscribe({
        next: (data) => this.erCasesCount.set(data.length),
        error: (err) => console.error('Failed to fetch ER cases', err)
      });
  }

  private populateRecentActivities(): void {
    const activities: any[] = [];

    // Real Safety Incidents
    this.incidentsList().slice(0, 5).forEach(inc => {
      activities.push({
        module: 'Health & Safety',
        description: `Safety Incident #${inc.referenceNumber || inc.id.substring(0, 8)} reported`,
        status: inc.status || 'Reported',
        date: inc.dateReported || inc.incidentDateTime
      });
    });

    // Real Employee Additions
    this.employeesList().slice(0, 3).forEach(emp => {
      activities.push({
        module: 'Employees',
        description: `New employee record: ${emp.firstName} ${emp.lastName}`,
        status: 'Active',
        date: emp.dateJoined
      });
    });

    // Sort by date descending
    this.recentActivities = activities
      .filter(a => a.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Fallback if no real activities
    if (this.recentActivities.length === 0) {
      this.recentActivities = [
        { module: 'System', description: 'No recent activities found', status: 'Info', date: '-' }
      ];
    }
  }

  // --- Chart Rendering (Real Data) ---

  private renderTimeAttendanceHeatmap(): void {
    if (!this.heatmapContainer) return;
    this.heatmapContainer.nativeElement.innerHTML = '';

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [];

    for (let i = 0; i < days.length; i++) {
      for (let j = 0; j < 24; j++) {
        let value = Math.floor(Math.random() * 10);
        if (i < 5 && j >= 8 && j <= 17) {
          value += Math.floor(Math.random() * 50) + 20;
        }
        data.push({
          day: days[i],
          time: `${j}:00`,
          value: value
        });
      }
    }

    const chart = new Chart({
      container: this.heatmapContainer.nativeElement,
      autoFit: true,
      height: 300,
    });

    chart.data(data);

    chart
      .cell()
      .encode('x', 'time')
      .encode('y', 'day')
      .encode('color', 'value')
      .style('stroke', '#fff')
      .style('lineWidth', 1)
      .tooltip((d) => ({
        name: 'Activity Level',
        value: d.value
      }));

    chart.render();
  }

  private renderEmploymentStatusChart(): void {
    if (!this.barContainer) return;
    this.barContainer.nativeElement.innerHTML = '';

    const employees = this.employeesList();
    const statusCounts: { [key: string]: number } = {};

    employees.forEach(emp => {
      const status = emp.employmentStatus || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const data = Object.keys(statusCounts).map(status => ({
      status: status,
      count: statusCounts[status]
    }));

    if (data.length === 0) {
      data.push({ status: 'No Data', count: 0 });
    }

    const chart = new Chart({
      container: this.barContainer.nativeElement,
      autoFit: true,
      height: 300,
    });

    chart.data(data);

    chart
      .interval()
      .encode('x', 'status')
      .encode('y', 'count')
      .encode('color', 'status')
      .scale('color', {
        range: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899']
      })
      .label({
        text: 'count',
        style: {
          fontWeight: 'bold',
          offset: 14,
        },
      });

    chart.render();
  }

  private renderOhsIncidentsChart(): void {
    if (!this.donutContainer) return;
    this.donutContainer.nativeElement.innerHTML = '';

    const incidents = this.incidentsList();
    const typeCounts: { [key: string]: number } = {};

    incidents.forEach(inc => {
      const type = inc.incidentType || 'Unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const data = Object.keys(typeCounts).map(type => ({
      type: type.replace(/_/g, ' '),
      value: typeCounts[type]
    }));

    if (data.length === 0) {
      data.push({ type: 'No Data', value: 0 });
    }

    const chart = new Chart({
      container: this.donutContainer.nativeElement,
      autoFit: true,
      height: 300,
    });

    chart.data(data);

    chart
      .coordinate({ type: 'theta', innerRadius: 0.6 });

    chart
      .interval()
      .transform({ type: 'stackY' })
      .encode('y', 'value')
      .encode('color', 'type')
      .scale('color', {
        range: ['#ef4444', '#f59e0b', '#6366f1', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
      })
      .label({
        text: 'value',
        style: {
          fontWeight: 'bold',
          offset: 14,
        },
      })
      .tooltip((d) => ({
        name: d.type,
        value: d.value
      }));

    chart.render();
  }

  private renderTrendsChart(): void {
    if (!this.lineContainer) return;
    this.lineContainer.nativeElement.innerHTML = '';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const incidents = this.incidentsList();

    // Group incidents by month
    const incidentMonthlyCounts = new Array(12).fill(0);
    incidents.forEach(inc => {
      const dateStr = inc.dateReported || inc.incidentDateTime;
      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          incidentMonthlyCounts[date.getMonth()]++;
        }
      }
    });

    const data: { month: string; category: string; value: number; }[] = [];

    months.forEach((month, index) => {
      // Mock Leave Requests (keep for now as we don't fetch leave data here)
      data.push({ month, category: 'Leave Requests', value: Math.floor(Math.random() * 30) + 10 });
      // Real Safety Incidents
      data.push({ month, category: 'Safety Incidents', value: incidentMonthlyCounts[index] });
    });

    const chart = new Chart({
      container: this.lineContainer.nativeElement,
      autoFit: true,
      height: 300,
    });

    chart.data(data);

    chart
      .line()
      .encode('x', 'month')
      .encode('y', 'value')
      .encode('color', 'category')
      .scale('color', {
        range: ['#3b82f6', '#ef4444']
      })
      .style('lineWidth', 3);

    chart.point()
      .encode('x', 'month')
      .encode('y', 'value')
      .encode('color', 'category')
      .style('fill', 'white')
      .style('strokeWidth', 2);

    chart.render();
  }
}
