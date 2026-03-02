import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Employee, EmployeesService } from '../../services/employees.service';
import { ErAnalyticsService } from '../../../er/services/er-analytics.service';
import { ErCaseService } from '../../../er/services/er-case.service';
import { ErWarningView, mapCaseToWarningView } from '../../../er/models/er-warning.model';
import { ErHearingView, extractHearingsFromCase } from '../../../er/models/er-hearing.model';
import { ErCaseDto } from '../../../er/process/models/er-process.model';
import {
  EmployeeLifecycleService,
  LeaveBalanceReport,
  LeaveRequestReport,
  AppraisalReport,
  ErCaseReport,
  OffboardingReport
} from '../../services/employee-lifecycle.service';

@Component({
  selector: 'app-view-employee',
  standalone: false,
  templateUrl: './view-employee.html',
  styleUrl: './view-employee.scss'
})
export class ViewEmployee implements OnInit {
  // 1️⃣ State Management using Signals
  employee: WritableSignal<Employee | null> = signal(null);
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  // ER Data Signals
  warnings = signal<ErWarningView[]>([]);
  hearings = signal<ErHearingView[]>([]);
  // Tab 4: Lifecycle data
  leaveBalances: WritableSignal<LeaveBalanceReport[]> = signal([]);
  leaveRequests: WritableSignal<LeaveRequestReport[]> = signal([]);
  appraisals: WritableSignal<AppraisalReport[]> = signal([]);
  erCases: WritableSignal<ErCaseReport[]> = signal([]);
  offboarding: WritableSignal<OffboardingReport[]> = signal([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeesService: EmployeesService,
    private erAnalyticsService: ErAnalyticsService,
    private erCaseService: ErCaseService,
    private lifecycleService: EmployeeLifecycleService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchEmployee(+id);
      this.fetchLifecycleData(+id);
    } else {
      this.error.set('Invalid employee ID');
    }
  }

  fetchEmployee(id: number): void {
    // 2️⃣ Signals set immediately, eliminating stale state
    this.loading.set(true);
    this.error.set(null);

    this.employeesService.getEmployeeById(id)
      .pipe(finalize(() => this.loading.set(false))) // Ensure loader is always cleared
      .subscribe({
        next: (data) => {
          this.employee.set(data);
          this.fetchERData(id);
        },
        error: (err) => {
          this.error.set(err.message);
        }
      });
  }

  fetchERData(id: number): void {
    this.erCaseService.getEmployeeDisciplinaryCases(id).subscribe({
      next: (cases) => {
        const warningViews = cases
          .filter(c => !!c.outcome)
          .map(c => mapCaseToWarningView(c))
          .filter(v => v !== null) as ErWarningView[];

        this.warnings.set(warningViews);

        const hearingViews: ErHearingView[] = [];
        cases.forEach(c => {
          hearingViews.push(...extractHearingsFromCase(c));
        });
        this.hearings.set(hearingViews);
      }
    });
  }

  fetchLifecycleData(id: number): void {
    this.lifecycleService.getLeaveBalances(id).subscribe(data => this.leaveBalances.set(data));
    this.lifecycleService.getLeaveRequests(id).subscribe(data => this.leaveRequests.set(data));
    this.lifecycleService.getAppraisals(id).subscribe(data => this.appraisals.set(data));
    this.lifecycleService.getErCases(id).subscribe(data => this.erCases.set(data));
    this.lifecycleService.getOffboarding(id).subscribe(data => this.offboarding.set(data));
  }

  cancel(): void {
    this.router.navigate(['/app/employees']);
  }

  getWarningLevel(erCase: ErCaseReport): string {
    if (!erCase.outcome) return 'N/A';

    const actionText = (erCase.outcome.actionTaken || '').toLowerCase();
    const summaryText = (erCase.outcome.decisionSummary || '').toLowerCase();
    const combinedText = actionText + ' ' + summaryText;

    if (combinedText.includes('final written')) return 'Final Written Warning';
    if (combinedText.includes('written')) return 'Written Warning';
    if (combinedText.includes('verbal')) return 'Verbal Warning';
    if (erCase.outcome.outcomeType === 'DISCIPLINARY_ACTION') return 'Disciplinary Action';

    return 'N/A';
  }

  getWarningLevelColor(level: string): string {
    if (level.includes('Final')) return 'red';
    if (level.includes('Written')) return 'orange';
    if (level.includes('Verbal')) return 'blue';
    return 'default';
  }

  getWarningAge(decisionAt: string | undefined): string {
    if (!decisionAt) return 'N/A';

    const decisionDate = new Date(decisionAt);
    const today = new Date();
    const diffMs = today.getTime() - decisionDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Future';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day';
    if (diffDays < 30) return `${diffDays} days`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 month';
    if (diffMonths < 12) return `${diffMonths} months`;

    const diffYears = Math.floor(diffMonths / 12);
    return diffYears === 1 ? '1 year' : `${diffYears} years`;
  }
}
