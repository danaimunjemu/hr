import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Employee, EmployeesService } from '../../services/employees.service';
import { ErAnalyticsService } from '../../../er/services/er-analytics.service';
import { ErCaseService } from '../../../er/services/er-case.service';
import { ErWarningView, mapCaseToWarningView } from '../../../er/models/er-warning.model';
import { ErHearingView, extractHearingsFromCase } from '../../../er/models/er-hearing.model';
import { ErCaseDto } from '../../../er/process/models/er-process.model';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeesService: EmployeesService,
    private erAnalyticsService: ErAnalyticsService,
    private erCaseService: ErCaseService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchEmployee(+id);
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

  cancel(): void {
    this.router.navigate(['/app/employees']);
  }
}
