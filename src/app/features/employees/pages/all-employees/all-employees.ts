import { Component, inject, computed, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { Employee, EmployeesService } from '../../services/employees.service';
import { NzTableComponent } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-all-employees',
  standalone: false,
  templateUrl: './all-employees.html',
  styleUrl: './all-employees.scss',
})
export class AllEmployees {
  private employeesService = inject(EmployeesService);
  searchTerm: WritableSignal<string> = signal('');
// openBulkOnboarding(): void {

// }

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
  filteredEmployees = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) {
      return this.employees();
    }

    return this.employees().filter((employee) => {
      const employeeNo = String(employee.employeeNumber ?? '').toLowerCase();
      const name = `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim().toLowerCase();
      const email = String(employee.email ?? '').toLowerCase();
      const jobTitle = String(employee.jobDescription?.name ?? '').toLowerCase();
      const department = String(employee.organizationalUnit?.name ?? '').toLowerCase();
      const status = String(employee.employmentStatus ?? '').toLowerCase();
      const userAccount = this.userAccountLabel(employee).toLowerCase();

      return (
        employeeNo.includes(query) ||
        name.includes(query) ||
        email.includes(query) ||
        jobTitle.includes(query) ||
        department.includes(query) ||
        status.includes(query) ||
        userAccount.includes(query)
      );
    });
  });

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  employeeNoFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.employees().map((employee) => String(employee.employeeNumber ?? '-')))].map((value) => ({
      text: value,
      value
    }));
  }

  employeeNoFilterFn = (values: string[], item: Employee): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.employeeNumber ?? '-'));
  };

  nameFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.employees().map((employee) => this.employeeName(employee)))].map((value) => ({
      text: value,
      value
    }));
  }

  nameFilterFn = (values: string[], item: Employee): boolean => {
    if (!values?.length) return true;
    return values.includes(this.employeeName(item));
  };

  emailFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.employees().map((employee) => String(employee.email ?? '-')))].map((value) => ({
      text: value,
      value
    }));
  }

  emailFilterFn = (values: string[], item: Employee): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.email ?? '-'));
  };

  jobTitleFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.employees().map((employee) => String(employee.jobDescription?.name ?? '-')))].map((value) => ({
      text: value,
      value
    }));
  }

  jobTitleFilterFn = (values: string[], item: Employee): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.jobDescription?.name ?? '-'));
  };

  departmentFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.employees().map((employee) => String(employee.organizationalUnit?.name ?? '-')))].map((value) => ({
      text: value,
      value
    }));
  }

  departmentFilterFn = (values: string[], item: Employee): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.organizationalUnit?.name ?? '-'));
  };

  statusFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.employees().map((employee) => String(employee.employmentStatus ?? '-')))].map((value) => ({
      text: value,
      value
    }));
  }

  statusFilterFn = (values: string[], item: Employee): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.employmentStatus ?? '-'));
  };

  userAccountFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.employees().map((employee) => this.userAccountLabel(employee)))].map((value) => ({
      text: value,
      value
    }));
  }

  userAccountFilterFn = (values: string[], item: Employee): boolean => {
    if (!values?.length) return true;
    return values.includes(this.userAccountLabel(item));
  };
resetFilters(): void {
  this.searchTerm.set('');
  // If you also want to clear column filters, you need to keep their state
  // somewhere (e.g. signals) and reset them here too.
}


  employeeName(employee: Employee): string {
    return `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim();
  }

  userAccountLabel(employee: Employee): 'Active' | 'Pending' | 'No User' {
    if (employee.user?.enabled) return 'Active';
    if (employee.user && !employee.user.enabled) return 'Pending';
    return 'No User';
  }
}
