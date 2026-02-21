import { Component, OnInit, signal, computed, AfterViewInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Chart } from '@antv/g2';
import { JobVacancyService } from '../../job-vacancies/services/job-vacancy.service';
import { JobVacancy } from '../../job-vacancies/models/job-vacancy.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-recruitment-page',
  standalone: false,
  templateUrl: './recruitment-page.component.html',
  styleUrl: './recruitment-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecruitmentPageComponent implements OnInit, AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Stats Signals
  stats = signal({
    totalJobs: 12,
    totalApplicants: 145,
    pendingInterviews: 24,
    hiresThisMonth: 5
  });

  // Vacancies List (Real Data)
  vacancies = signal<any[]>([]);

  // Sample Job Data (Keep for now if needed elsewhere, but user asked for table from GET)
  jobs = signal([
    { id: 1, title: 'Senior Frontend Engineer', location: 'Remote', type: 'Full-time', applicants: 45, interviews: 8 },
    { id: 2, title: 'Product Designer', location: 'New York', type: 'Contract', applicants: 28, interviews: 4 },
    { id: 3, title: 'Marketing Manager', location: 'London', type: 'Full-time', applicants: 62, interviews: 12 }
  ]);

  // Recent Candidates
  candidates = signal([
    {
      name: 'Alice Cooper',
      position: 'Senior Frontend Engineer',
      status: 'Interview',
      appliedDate: '2 hours ago',
      avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
    },
    {
      name: 'Bob Marley',
      position: 'Product Designer',
      status: 'Review',
      appliedDate: '5 hours ago',
      avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
    }
  ]);

  // Upcoming Interviews (Signals)
  interviews = signal([
    { id: 101, candidate: 'Alice Cooper', time: '10:00 AM', date: new Date(), type: 'Technical' },
    { id: 102, candidate: 'Bob Marley', time: '02:00 PM', date: new Date(), type: 'Behavioral' },
    { id: 103, candidate: 'Charlie Brown', time: '11:30 AM', date: new Date(new Date().setDate(new Date().getDate() + 1)), type: 'Final' }
  ]);

  chart: Chart | null = null;

  constructor(private jobVacancyService: JobVacancyService) { }

  ngOnInit(): void {
    this.loadVacancies();
    // Simulate other API loading
    setTimeout(() => {
      this.loading.set(false);
      // Give Angular time to render the chart container
      setTimeout(() => this.renderChart(), 100);
    }, 1000);
  }

  ngAfterViewInit(): void {
    // Initial chart render if already loaded (unlikely due to delay)
    if (!this.loading()) {
      this.renderChart();
    }
  }

  renderChart(): void {
    if (!this.chartContainer) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const data = [
      { month: 'Jan', value: 30 },
      { month: 'Feb', value: 45 },
      { month: 'Mar', value: 35 },
      { month: 'Apr', value: 50 },
      { month: 'May', value: 40 },
      { month: 'Jun', value: 35 },
      { month: 'Jul', value: 55 },
      { month: 'Aug', value: 40 },
    ];

    this.chart = new Chart({
      container: this.chartContainer.nativeElement,
      autoFit: true,
      height: 300,
      padding: 'auto'
    });

    this.chart
      .interval()
      .data(data)
      .encode('x', 'month')
      .encode('y', 'value')
      .encode('color', 'month')
      .style('radius', [4, 4, 0, 0])
      .label({
        text: 'value',
        style: {
          fill: '#fff',
          dy: 10
        },
      });

    this.chart.render();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'New': return 'blue';
      case 'Review': return 'orange';
      case 'Interview': return 'purple';
      case 'Offer': return 'green';
      case 'Rejected': return 'red';
      default: return 'default';
    }
  }

  getListData(date: Date): any[] {
    const d = date.getDate();
    const m = date.getMonth();
    const y = date.getFullYear();

    return this.interviews().filter(i => {
      const interviewDate = new Date(i.date);
      return interviewDate.getDate() === d &&
        interviewDate.getMonth() === m &&
        interviewDate.getFullYear() === y;
    });
  }

  viewApplicants(id: string): void {
    console.log('View applicants for job', id);
  }

  loadVacancies(): void {
    this.loading.set(true);
    this.jobVacancyService.getAll().pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (data) => this.vacancies.set(data),
      error: () => this.error.set('Failed to load job vacancies')
    });
  }

  getJobVacancyStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'CLOSED': return 'default';
      case 'ON_HOLD': return 'warning';
      case 'FULFILLED': return 'blue';
      case 'PENDING_APPROVAL': return 'processing';
      default: return 'default';
    }
  }
}
