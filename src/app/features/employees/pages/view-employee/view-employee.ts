import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Employee, EmployeesService } from '../../services/employees.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeesService: EmployeesService
  ) {}

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
        },
        error: (err) => {
          this.error.set(err.message);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/app/employees']);
  }
}
