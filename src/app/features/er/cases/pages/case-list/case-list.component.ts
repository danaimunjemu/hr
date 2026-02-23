import { Component, OnInit, signal, WritableSignal, computed, AfterViewInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ErCaseService } from '../../services/er-case.service';
import { ErCase, CaseStatus, Priority } from '../../models/er-case.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Chart } from '@antv/g2';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-case-list',
  standalone: false,
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaseListComponent implements OnInit, AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  cases: WritableSignal<ErCase[]> = signal([]);
  loading: WritableSignal<boolean> = signal(true);

  // Filters
  searchQuery = signal<string>('');
  statusFilter = signal<CaseStatus | 'ALL'>('ALL');
  priorityFilter = signal<Priority | 'ALL'>('ALL');

  // Computed signals for stats
  stats = computed(() => {
    const all = this.cases();
    return {
      total: all.length,
      open: all.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS' || c.status === 'TRIAGE').length,
      closed: all.filter(c => c.status === 'CLOSED').length,
      highPriority: all.filter(c => c.priority === 'HIGH').length
    };
  });

  // Computed signal for filtered list
  filteredCases = computed(() => {
    let list = this.cases();
    const query = this.searchQuery().toLowerCase();
    const status = this.statusFilter();
    const priority = this.priorityFilter();

    if (query) {
      list = list.filter(c => c.title.toLowerCase().includes(query) || c.caseNumber?.toLowerCase().includes(query));
    }

    if (status !== 'ALL') {
      list = list.filter(c => c.status === status);
    }

    if (priority !== 'ALL') {
      list = list.filter(c => c.priority === priority);
    }

    return list;
  });

  chart: Chart | null = null;

  constructor(
    private caseService: ErCaseService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadCases();
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  loadCases(): void {
    this.loading.set(true);
    this.caseService.getCases()
      .pipe(finalize(() => {
        this.loading.set(false);
        // Delay chart render to ensure container is ready and data is set
        setTimeout(() => this.renderChart(), 100);
      }))
      .subscribe({
        next: (data) => this.cases.set(data),
        error: () => this.message.error('Failed to load cases')
      });
  }

  renderChart(): void {
    if (!this.chartContainer || this.cases().length === 0) return;

    if (this.chart) {
      this.chart.destroy();
    }

    // Prepare data: count cases per day
    const dateMap = new Map<string, number>();
    this.cases().forEach(c => {
      if (c.createdOn) {
        const date = new Date(c.createdOn).toLocaleDateString();
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      }
    });

    const chartData = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    this.chart = new Chart({
      container: this.chartContainer.nativeElement,
      autoFit: true,
      height: 300,
    });

    this.chart
      .line()
      .data(chartData)
      .encode('x', 'date')
      .encode('y', 'count')
      .encode('shape', 'smooth')
      .label({
        text: 'count',
        style: {
          dy: -10,
        },
      });

    this.chart
      .point()
      .data(chartData)
      .encode('x', 'date')
      .encode('y', 'count')
      .tooltip(false);

    this.chart.render();
  }

  deleteCase(id: number): void {
    this.caseService.deleteCase(id).subscribe({
      next: () => {
        this.message.success('Case deleted');
        this.loadCases();
      },
      error: () => this.message.error('Failed to delete case')
    });
  }

  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'OPEN': return 'blue';
      case 'CLOSED': return 'green';
      case 'TRIAGE': return 'gold';
      case 'IN_PROGRESS': return 'geekblue';
      default: return 'default';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'orange';
      case 'LOW': return 'green';
      default: return 'default';
    }
  }
}
