import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OffboardingAnalytics } from '../../services/offboarding-v2-mock.store';
import { OffboardingV2FacadeService } from '../../services/offboarding-v2-facade.service';

@Component({
  selector: 'app-analytics-dashboard-page',
  standalone: false,
  templateUrl: './analytics-dashboard-page.component.html',
  styleUrl: './analytics-dashboard-page.component.scss'
})
export class AnalyticsDashboardPageComponent implements OnInit, OnDestroy {
  offboardingId = '';
  data: OffboardingAnalytics | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly facade: OffboardingV2FacadeService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.offboardingId = this.route.snapshot.paramMap.get('offboardingId') || '';
    this.facade
      .getAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.data = data;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  maxValue(values: Array<{ value: number }>): number {
    return Math.max(...values.map((item) => item.value), 1);
  }

  barWidth(value: number, max: number): string {
    return `${Math.round((value / max) * 100)}%`;
  }

  back(): void {
    if (this.offboardingId) {
      this.router.navigate(['/app/offboarding-v2/case', this.offboardingId]);
      return;
    }
    this.router.navigate(['/app/offboarding-v2']);
  }
}
