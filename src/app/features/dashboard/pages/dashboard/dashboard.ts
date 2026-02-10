import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, signal, effect } from '@angular/core';
import { Chart } from '@antv/g2';
import { finalize } from 'rxjs';

// Services (Keep for top cards only)
import { EmployeesService } from '../../../employees/services/employees.service';
import { OhsService } from '../../../health-and-safety/services/ohs.service';
import { ErCaseService } from '../../../er/cases/services/er-case.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  // Signals for Top Cards Data (Real Data)
  totalEmployees = signal<number>(0);
  safetyIncidentsCount = signal<number>(0);
  erCasesCount = signal<number>(0);
  
  // Loading State
  loading = signal<boolean>(true);

  // Chart References
  @ViewChild('heatmapContainer') heatmapContainer!: ElementRef;
  @ViewChild('barContainer') barContainer!: ElementRef;
  @ViewChild('donutContainer') donutContainer!: ElementRef;
  @ViewChild('lineContainer') lineContainer!: ElementRef;

  // Mock Data for Tables
  recentActivities = [
    { module: 'Health & Safety', description: 'Safety Incident #INC-001 submitted', status: 'Pending', date: '2026-02-06 09:30' },
    { module: 'Time & Leave', description: 'Leave request for John Doe approved', status: 'Approved', date: '2026-02-05 14:15' },
    { module: 'Training', description: 'Cybersecurity Awareness completed', status: 'Completed', date: '2026-02-05 11:00' },
    { module: 'Recruitment', description: 'New candidate applied for Senior Dev', status: 'New', date: '2026-02-04 16:45' },
    { module: 'Employee Relations', description: 'Grievance case #ER-204 updated', status: 'In Progress', date: '2026-02-04 10:20' }
  ];

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

    // Using a simple counter to track completion of all 3 requests
    let completed = 0;
    const checkDone = () => {
      completed++;
      if (completed >= 3) {
        this.loading.set(false);
      }
    };

    // 1. Employees
    this.employeesService.getEmployees()
      .pipe(finalize(() => checkDone()))
      .subscribe({
        next: (data) => this.totalEmployees.set(data.length),
        error: (err) => console.error('Failed to fetch employees', err)
      });

    // 2. Safety Incidents
    this.ohsService.getSafetyIncidents()
      .pipe(finalize(() => checkDone()))
      .subscribe({
        next: (data) => this.safetyIncidentsCount.set(data.length),
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

  // --- Chart Rendering (Mock Data) ---

  private renderTimeAttendanceHeatmap(): void {
    if (!this.heatmapContainer) return;
    this.heatmapContainer.nativeElement.innerHTML = '';

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [];

    for (let i = 0; i < days.length; i++) {
      for (let j = 0; j < 24; j++) {
        let value = Math.floor(Math.random() * 10);
        // Simulate higher activity during work hours (8-17) on weekdays
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

    const data = [
      { status: 'Active', count: 145 },
      { status: 'On Leave', count: 12 },
      { status: 'Suspended', count: 3 },
      { status: 'Terminated', count: 8 }
    ];

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
        range: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] // Muted blue, green, orange, red
      });

    chart.render();
  }

  private renderOhsIncidentsChart(): void {
    if (!this.donutContainer) return;
    this.donutContainer.nativeElement.innerHTML = '';

    const data = [
      { type: 'Injury', value: 15 },
      { type: 'Near Miss', value: 45 },
      { type: 'Property Damage', value: 10 },
      { type: 'Environmental', value: 5 }
    ];

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
        range: ['#ef4444', '#f59e0b', '#6366f1', '#10b981']
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
    const data: { month: string; category: string; value: number; }[] = [];

    months.forEach(month => {
      data.push({ month, category: 'Leave Requests', value: Math.floor(Math.random() * 30) + 10 });
      data.push({ month, category: 'Safety Incidents', value: Math.floor(Math.random() * 10) });
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
