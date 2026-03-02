import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Employee, EmployeesService } from '../../services/employees.service';
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
    private lifecycleService: EmployeeLifecycleService
  ) {}

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
        },
        error: (err) => {
          this.error.set(err.message);
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
}
