import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  signal,
  WritableSignal
} from '@angular/core';
import { Chart } from '@antv/g2';
import { forkJoin } from 'rxjs';
import { OhsService } from '../../services/ohs.service';
import { MedicalSurveillance, NearMissReport, SafetyIncident } from '../../models/ohs.model';

@Component({
  selector: 'app-health-and-safety-page',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './health-and-safety-page.component.html',
  styleUrl: './health-and-safety-page.component.scss'
})
export class HealthAndSafetyPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trendChartContainer') trendChartContainer?: ElementRef<HTMLElement>;
  @ViewChild('distributionChartContainer') distributionChartContainer?: ElementRef<HTMLElement>;

  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);
  incidents: WritableSignal<SafetyIncident[]> = signal([]);
  nearMisses: WritableSignal<NearMissReport[]> = signal([]);
  medicalSurveillances: WritableSignal<MedicalSurveillance[]> = signal([]);
  activeTab: WritableSignal<'incidents' | 'nearMisses' | 'medical'> = signal('incidents');

  readonly tabOptions = [
    { label: 'Safety Incidents', value: 'incidents' },
    { label: 'Near Misses', value: 'nearMisses' },
    { label: 'Medical Surveillance', value: 'medical' }
  ];

  private trendChart: Chart | null = null;
  private distributionChart: Chart | null = null;
  private chartRenderTimer: ReturnType<typeof setTimeout> | null = null;
  private viewReady = false;

  constructor(
    private ohsService: OhsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.scheduleChartRender();
  }

  ngOnDestroy(): void {
    if (this.chartRenderTimer) {
      clearTimeout(this.chartRenderTimer);
      this.chartRenderTimer = null;
    }
    this.destroyCharts();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      incidents: this.ohsService.getSafetyIncidents(),
      nearMisses: this.ohsService.getNearMissReports(),
      medicalSurveillances: this.ohsService.getMedicalSurveillances()
    }).subscribe({
      next: ({ incidents, nearMisses, medicalSurveillances }) => {
        this.incidents.set(this.sortByDateDesc(incidents, (item) => item.incidentDateTime || item.dateReported));
        this.nearMisses.set(this.sortByDateDesc(nearMisses, (item) => item.incidentDateTime || item.dateReported));
        this.medicalSurveillances.set(this.sortByDateDesc(medicalSurveillances, (item) => item.examinationDate || item.dateReported));
        this.loading.set(false);
        this.cdr.detectChanges();
        this.scheduleChartRender();
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load dashboard data');
        this.loading.set(false);
      }
    });
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CATASTROPHIC':
      case 'FATALITY':
      case 'MAJOR':
        return 'red';
      case 'SERIOUS':
      case 'MODERATE':
        return 'orange';
      default: return 'green';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'SUBMITTED':
        return 'blue';
      default:
        return 'default';
    }
  }

  getTotalReports(): number {
    return this.incidents().length + this.nearMisses().length + this.medicalSurveillances().length;
  }

  getOpenItemsCount(): number {
    const isOpen = (status: string) => status === 'DRAFT' || status === 'REJECTED';
    return this.incidents().filter((item) => isOpen(item.status)).length
      + this.nearMisses().filter((item) => isOpen(item.status)).length
      + this.medicalSurveillances().filter((item) => isOpen(item.status)).length;
  }

  getSubmittedItemsCount(): number {
    const isSubmitted = (status: string) => status === 'SUBMITTED';
    return this.incidents().filter((item) => isSubmitted(item.status)).length
      + this.nearMisses().filter((item) => isSubmitted(item.status)).length
      + this.medicalSurveillances().filter((item) => isSubmitted(item.status)).length;
  }

  getReporterName(reportedBy: any): string {
    if (!reportedBy) {
      return '-';
    }
    if (typeof reportedBy === 'object' && (reportedBy.firstName || reportedBy.lastName)) {
      return `${reportedBy.firstName || ''} ${reportedBy.lastName || ''}`.trim();
    }
    return String(reportedBy);
  }

  getEmployeeLabel(employee: any): string {
    if (!employee) {
      return '-';
    }
    if (typeof employee === 'object') {
      if (employee.firstName || employee.lastName) {
        return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
      }
      return employee.id ? `#${employee.id}` : '-';
    }
    return String(employee);
  }

  private sortByDateDesc<T>(items: T[], dateExtractor: (item: T) => string): T[] {
    return [...items].sort((a, b) => {
      const dateA = new Date(dateExtractor(a)).getTime();
      const dateB = new Date(dateExtractor(b)).getTime();
      return dateB - dateA;
    });
  }

  private renderCharts(): void {
    if (!this.viewReady || !this.trendChartContainer || !this.distributionChartContainer) {
      return;
    }

    this.renderTrendChart();
    this.renderDistributionChart();
  }

  private renderTrendChart(): void {
    if (!this.trendChartContainer) {
      return;
    }

    const container = this.trendChartContainer.nativeElement;
    if (this.trendChart) {
      this.trendChart.destroy();
      this.trendChart = null;
    }
    container.innerHTML = '';

    const trendData = this.buildTrendData();
    if (trendData.length === 0) {
      return;
    }

    this.trendChart = new Chart({
      container,
      autoFit: true,
      height: 320
    });

    this.trendChart.data(trendData);
    this.trendChart.line()
      .encode('x', 'month')
      .encode('y', 'count')
      .encode('color', 'category')
      .style('lineWidth', 2);

    this.trendChart.point()
      .encode('x', 'month')
      .encode('y', 'count')
      .encode('color', 'category')
      .style('fill', '#fff')
      .style('lineWidth', 1.5);

    this.trendChart.scale('color', {
      range: ['#1677ff', '#fa8c16', '#13c2c2']
    });

    this.trendChart.render();
  }

  private renderDistributionChart(): void {
    if (!this.distributionChartContainer) {
      return;
    }

    const container = this.distributionChartContainer.nativeElement;
    if (this.distributionChart) {
      this.distributionChart.destroy();
      this.distributionChart = null;
    }
    container.innerHTML = '';

    const distributionData = [
      { category: 'Safety Incidents', value: this.incidents().length },
      { category: 'Near Misses', value: this.nearMisses().length },
      { category: 'Medical Surveillance', value: this.medicalSurveillances().length }
    ];

    const total = distributionData.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      return;
    }

    this.distributionChart = new Chart({
      container,
      autoFit: true,
      height: 320
    });

    this.distributionChart.data(distributionData);
    this.distributionChart.coordinate({ type: 'theta', innerRadius: 0.5 });
    this.distributionChart.interval()
      .transform({ type: 'stackY' })
      .encode('y', 'value')
      .encode('color', 'category')
      .label({
        text: 'value',
        style: {
          fontWeight: 'bold'
        }
      });

    this.distributionChart.scale('color', {
      range: ['#1677ff', '#fa8c16', '#13c2c2']
    });

    this.distributionChart.render();
  }

  private scheduleChartRender(): void {
    if (this.chartRenderTimer) {
      clearTimeout(this.chartRenderTimer);
    }
    this.chartRenderTimer = setTimeout(() => {
      this.chartRenderTimer = null;
      this.renderCharts();
    }, 0);
  }

  private buildTrendData(): Array<{ month: string; category: string; count: number }> {
    const months = this.getLastSixMonthKeys();
    const buildRows = (label: string, source: string[]) => {
      const counts = new Map<string, number>();
      source.forEach((date) => {
        const key = this.toMonthKey(date);
        counts.set(key, (counts.get(key) || 0) + 1);
      });

      return months.map((month) => ({
        month: this.formatMonthKey(month),
        category: label,
        count: counts.get(month) || 0
      }));
    };

    const incidentDates = this.incidents().map((item) => item.incidentDateTime || item.dateReported).filter(Boolean);
    const nearMissDates = this.nearMisses().map((item) => item.incidentDateTime || item.dateReported).filter(Boolean);
    const medicalDates = this.medicalSurveillances().map((item) => item.examinationDate || item.dateReported).filter(Boolean);

    return [
      ...buildRows('Safety Incidents', incidentDates),
      ...buildRows('Near Misses', nearMissDates),
      ...buildRows('Medical Surveillance', medicalDates)
    ];
  }

  private getLastSixMonthKeys(): string[] {
    const result: string[] = [];
    const date = new Date();
    date.setDate(1);
    for (let i = 5; i >= 0; i--) {
      const current = new Date(date.getFullYear(), date.getMonth() - i, 1);
      result.push(this.toMonthKey(current.toISOString()));
    }
    return result;
  }

  private toMonthKey(dateString: string): string {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${date.getFullYear()}-${month}`;
  }

  private formatMonthKey(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(+year, +month - 1, 1);
    return date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
  }

  private destroyCharts(): void {
    if (this.trendChart) {
      this.trendChart.destroy();
      this.trendChart = null;
    }
    if (this.distributionChart) {
      this.distributionChart.destroy();
      this.distributionChart = null;
    }
  }
}
