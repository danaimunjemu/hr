import { Component, OnInit, ElementRef, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart } from '@antv/g2';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData } from '../../models/dashboard.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, takeUntil, finalize } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  loading = true;
  data: DashboardData | null = null;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  private charts: Chart[] = [];

  // Query chart containers
  @ViewChildren('chartContainer') chartContainers!: QueryList<ElementRef>;

  constructor(
    private dashboardService: DashboardService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Wait for data to load before initializing charts
    // Charts will be initialized in loadDashboardData subscription
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.charts.forEach(chart => chart.destroy());
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getDashboardData()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (data) => {
          this.data = data;
          // Small timeout to allow DOM to render before charting
          setTimeout(() => this.initializeCharts(), 100);
        },
        error: (err) => {
          console.error('Dashboard load error', err);
          this.error = 'Failed to load dashboard metrics. Please try again later.';
          this.message.error('Could not load dashboard data');
        }
      });
  }

  private initializeCharts(): void {
    if (!this.data || !this.chartContainers) return;

    // Clear existing charts
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    const containers = this.chartContainers.toArray();
    let index = 0;

    // Helper to get container
    const getContainer = () => containers[index++]?.nativeElement;

    // --- OHS Charts ---
    if (this.data.ohs) {
      this.renderDonutChart(getContainer(), this.data.ohs.charts.incidentsByType, 'Type', 'Value');
      this.renderLineChart(getContainer(), this.data.ohs.charts.incidentTrend, 'Label', 'Value');
      this.renderBarChart(getContainer(), this.data.ohs.charts.investigationStatus, 'Label', 'Value');
      this.renderStackedBarChart(getContainer(), this.data.ohs.charts.nearMissSeverity, 'Label', 'Value', 'Category');
    }

    // --- ER Charts ---
    if (this.data.er) {
      this.renderColumnChart(getContainer(), this.data.er.charts.casesByStage, 'Label', 'Value');
      this.renderBarChart(getContainer(), this.data.er.charts.caseVolumeByDept, 'Label', 'Value');
      this.renderPieChart(getContainer(), this.data.er.charts.casePriority, 'Label', 'Value');
      this.renderHorizontalBarChart(getContainer(), this.data.er.charts.tasksByAssignee, 'Label', 'Value');
    }

    // --- Time & Leave Charts ---
    if (this.data.timeLeave) {
      this.renderPieChart(getContainer(), this.data.timeLeave.charts.leaveTypeDistribution, 'Label', 'Value');
      this.renderLineChart(getContainer(), this.data.timeLeave.charts.overtimeTrend, 'Label', 'Value');
      this.renderColumnChart(getContainer(), this.data.timeLeave.charts.leaveStatusOverview, 'Label', 'Value');
    }

    // --- Workforce Charts ---
    if (this.data.workforce) {
      this.renderBarChart(getContainer(), this.data.workforce.charts.headcountByDept, 'Label', 'Value');
      this.renderPieChart(getContainer(), this.data.workforce.charts.employmentTypeSplit, 'Label', 'Value');
      this.renderHistogram(getContainer(), this.data.workforce.charts.tenureDistribution, 'Label', 'Value');
    }
  }

  // --- G2 Chart Renderers ---

  private renderDonutChart(container: HTMLElement, data: any[], xField: string, yField: string) {
    if (!container || !data || data.length === 0) return;
    const chart = new Chart({ container, autoFit: true });
    chart.coordinate({ type: 'theta', outerRadius: 0.8, innerRadius: 0.5 });
    chart.interval().data(data).transform({ type: 'stackY' }).encode('y', yField).encode('color', xField).tooltip({ channel: 'y', valueFormatter: (d) => `${d}` });
    chart.render();
    this.charts.push(chart);
  }

  private renderPieChart(container: HTMLElement, data: any[], xField: string, yField: string) {
    if (!container || !data || data.length === 0) return;
    const chart = new Chart({ container, autoFit: true });
    chart.coordinate({ type: 'theta', outerRadius: 0.8 });
    chart.interval().data(data).transform({ type: 'stackY' }).encode('y', yField).encode('color', xField).tooltip({ channel: 'y', valueFormatter: (d) => `${d}` });
    chart.render();
    this.charts.push(chart);
  }

  private renderLineChart(container: HTMLElement, data: any[], xField: string, yField: string) {
    if (!container || !data || data.length === 0) return;
    const chart = new Chart({ container, autoFit: true });
    chart.line().data(data).encode('x', xField).encode('y', yField).encode('shape', 'smooth');
    chart.point().data(data).encode('x', xField).encode('y', yField).style('fill', 'white').style('stroke', '#1890ff');
    chart.render();
    this.charts.push(chart);
  }

  private renderBarChart(container: HTMLElement, data: any[], xField: string, yField: string) {
    if (!container || !data || data.length === 0) return;
    const chart = new Chart({ container, autoFit: true });
    chart.interval().data(data).encode('x', xField).encode('y', yField);
    chart.render();
    this.charts.push(chart);
  }

  private renderColumnChart(container: HTMLElement, data: any[], xField: string, yField: string) {
     this.renderBarChart(container, data, xField, yField); // G2 interval handles both based on axes usually, ensuring vertical
  }

  private renderHorizontalBarChart(container: HTMLElement, data: any[], xField: string, yField: string) {
    if (!container || !data || data.length === 0) return;
    const chart = new Chart({ container, autoFit: true });
    chart.coordinate({ transform: [{ type: 'transpose' }] });
    chart.interval().data(data).encode('x', xField).encode('y', yField);
    chart.render();
    this.charts.push(chart);
  }

  private renderStackedBarChart(container: HTMLElement, data: any[], xField: string, yField: string, colorField: string) {
    if (!container || !data || data.length === 0) return;
    const chart = new Chart({ container, autoFit: true });
    chart.interval().data(data).encode('x', xField).encode('y', yField).encode('color', colorField);
    chart.render();
    this.charts.push(chart);
  }

  private renderHistogram(container: HTMLElement, data: any[], xField: string, yField: string) {
    this.renderBarChart(container, data, xField, yField);
  }
}
