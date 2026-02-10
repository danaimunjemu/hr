import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { Employee, EmployeesService } from '../../services/employees.service';

@Component({
  selector: 'app-all-employees',
  standalone: false,
  templateUrl: './all-employees.html',
  styleUrl: './all-employees.scss',
})
export class AllEmployees {
  private employeesService = inject(EmployeesService);

  // Reactive state signal derived from the service observable
  // Handles loading, success, and error states automatically
  private state = toSignal(
    this.employeesService.getEmployees().pipe(
      map(data => ({ loading: false, data, error: null })),
      startWith({ loading: true, data: [] as Employee[], error: null }),
      catchError(err => of({ loading: false, data: [] as Employee[], error: err.message }))
    ),
    { initialValue: { loading: true, data: [] as Employee[], error: null } }
  );

  // Computed signals exposed to the template
  // The template will automatically update when these computed values change
  employees = computed(() => this.state().data);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
}
