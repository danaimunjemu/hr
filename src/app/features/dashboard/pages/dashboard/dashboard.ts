import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, signal, effect } from '@angular/core';
import { Chart } from '@antv/g2';
import { finalize, forkJoin } from 'rxjs';

// Services (Keep for top cards only)
import { EmployeesService, Employee } from '../../../employees/services/employees.service';
import { OhsService } from '../../../health-and-safety/services/ohs.service';
import { ErCaseService } from '../../../er/cases/services/er-case.service';
import { SafetyIncident, NearMissReport, MedicalSurveillance } from '../../../health-and-safety/models/ohs.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  // Data Signals
  totalEmployees = signal<number>(0);
  totalOhsReportsCount = signal<number>(0);
  erCasesCount = signal<number>(0);

  employeesList = signal<Employee[]>([]);
  incidentsList = signal<SafetyIncident[]>([]);
  nearMissesList = signal<NearMissReport[]>([]);
  medicalSurveillancesList = signal<MedicalSurveillance[]>([]);

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

    // 2. Health & Safety Data (Incidents, Near Misses, Medical)
    forkJoin({
      incidents: this.ohsService.getSafetyIncidents(),
      nearMisses: this.ohsService.getNearMissReports(),
      medicalSurveillances: this.ohsService.getMedicalSurveillances()
    })
      .pipe(finalize(() => checkDone()))
      .subscribe({
        next: ({ incidents, nearMisses, medicalSurveillances }) => {
          this.incidentsList.set(incidents);
          this.nearMissesList.set(nearMisses);
          this.medicalSurveillancesList.set(medicalSurveillances);

          const total = incidents.length + nearMisses.length + medicalSurveillances.length;
          this.totalOhsReportsCount.set(total);
        },
        error: (err) => console.error('Failed to fetch OHS data', err)
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
    const departmentCounts: { [key: string]: number } = {};

    employees.forEach(emp => {
      // Since all dataset items are "ACTIVE", distributing by Organizational Unit or Group is more insightful
      const department = emp.organizationalUnit?.name || emp.group?.name || 'Unassigned';
      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    });

    const data = Object.keys(departmentCounts).map(dept => ({
      category: dept,
      count: departmentCounts[dept]
    }));

    if (data.length === 0) {
      data.push({ category: 'No Data', count: 0 });
    }

    // Sort by count descending so the largest bars are first
    data.sort((a, b) => b.count - a.count);

    const chart = new Chart({
      container: this.barContainer.nativeElement,
      autoFit: true,
      height: 300,
    });

    chart.data(data);

    chart
      .interval()
      .encode('x', 'category')
      .encode('y', 'count')
      .encode('color', 'category')
      .scale('color', {
        range: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6']
      })
      .label({
        text: 'count',
        style: {
          fontWeight: 'bold',
          offset: 14,
        },
      })
      .tooltip((d) => ({
        name: 'Employees',
        value: d.count
      }));

    chart.render();
  }

  private renderOhsIncidentsChart(): void {
    if (!this.donutContainer) return;
    this.donutContainer.nativeElement.innerHTML = '';

    const distributionData = [
      { category: 'Safety Incidents', value: this.incidentsList().length },
      { category: 'Near Misses', value: this.nearMissesList().length },
      { category: 'Medical Surveillance', value: this.medicalSurveillancesList().length }
    ];

    const total = distributionData.reduce((sum, item) => sum + item.value, 0);
    const data = total === 0 ? [{ category: 'No Data', value: 1 }] : distributionData;

    const chart = new Chart({
      container: this.donutContainer.nativeElement,
      autoFit: true,
      height: 300,
    });

    chart.data(data);

    chart
      .coordinate({ type: 'theta', innerRadius: 0.5 });

    chart
      .interval()
      .transform({ type: 'stackY' })
      .encode('y', 'value')
      .encode('color', 'category')
      .label(total === 0 ? false : {
        text: 'value',
        style: {
          fontWeight: 'bold',
          offset: 14,
        },
      })
      .scale('color', {
        range: total === 0 ? ['#e5e7eb'] : ['#1677ff', '#fa8c16', '#13c2c2']
      })
      .tooltip((d) => total === 0 ? { name: 'No Data', value: 0 } : {
        name: d.category,
        value: d.value
      });

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
