import { Component, inject, computed, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { Employee, EmployeesService } from '../../services/employees.service';
import { NzTableComponent } from 'ng-zorro-antd/table';
import * as XLSX from 'xlsx';

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
      const jobTitle = String(employee.position?.name ?? '').toLowerCase();
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
    return [...new Set(this.employees().map((employee) => String(employee.position?.name ?? '-')))].map((value) => ({
      text: value,
      value
    }));
  }

  jobTitleFilterFn = (values: string[], item: Employee): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.position?.name ?? '-'));
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

  exportToExcel(): void {
    const data = this.filteredEmployees();
    const rows = data.map((e) => ({
      'Legal Entity': e.company?.name ?? '',
      'Employee ID': e.employeeNumber ?? '',
      'Title': e.title ?? '',
      'Initials': e.initials ?? '',
      'Last Name': e.lastName ?? '',
      'First Name': e.firstName ?? '',
      'Middle Name(s)': e.middleName ?? '',
      'Preferred Name': e.preferredName ?? '',
      'National ID Number': e.nationalId ?? '',
      'Nationality': e.nationality ?? '',
      'Date of Birth': e.dateOfBirth ?? '',
      'Gender': e.gender ?? '',
      'Race': e.ethnicGroup?.name ?? '',
      'Partnership Status': e.maritalStatus ?? '',
      'Mobile Telephone': e.mobilePhone ?? '',
      'Home Telephone': e.homePhone ?? '',
      'Email': e.email ?? '',
      'Work Address': e.address?.physicalAddress ?? '',
      'Tax Number': e.taxNumber ?? '',
      'Tax ID Format Validated': e.taxIdValidated ? 'Validated' : 'Not Validated',
      'Tax No Outstanding': e.taxOutstanding ? 'Yes' : 'No',
      'Payment Method': e.paymentMethod ?? '',
      'Bank': e.bankDetail?.bankName ?? '',
      'Branch': e.bankDetail?.bankBranchCode ?? '',
      'Account Type': e.bankDetail?.accountType ?? '',
      'Bank Account Number': e.bankDetail?.bankAccountNumber ?? '',
      'Department': e.organizationalUnit?.name ?? '',
      'Sub_Department': e.subOrganizationalUnit?.name ?? '',
      'Position Code': e.positionCode ?? '',
      'Position': e.position?.name ?? '',
      'Shift Type': e.shiftType ?? '',
      'Company Code': e.company?.name ?? '',
      'Employee Type': e.employmentType ?? '',
      'Status': e.employmentStatus ?? '',
      'Primary Location': e.companyLocation?.name ?? '',
      'Manager': e.superior ? `${e.superior.firstName ?? ''} ${e.superior.lastName ?? ''}`.trim() : '',
      'Employee Status': e.employmentStatus ?? '',
      'Employee Lifecycle Stage': e.lifecycleStage ?? '',
      'Start Date': e.dateJoined ?? '',
      'Last Work Day': e.lastWorkDate ?? '',
      'Category': e.category ?? '',
      'Department Code': e.departmentCode ?? '',
      'Regional_Council': e.regionalCouncil ?? '',
      'Job_Category': e.jobCategory ?? '',
      'Job_Category2': e.jobCategory2 ?? '',
      'Divisional_Report': e.divisionalReport ?? '',
      'Coms_Division': e.comsDivision ?? '',
      'Commission Earner': e.commissionEarner ? 'Yes' : 'No',
      'Carries_Target': e.carriesTarget ? 'Yes' : 'No',
      'Department_of_labour': e.departmentOfLabour?.name ?? '',
      'BBBEE Occupational Level': e.bbbeeLevel ?? '',
      'Cell Allowance': e.cellAllowance ?? '',
      'Petrol Allowance': e.petrolAllowance ?? '',
      'Petrol Card': e.petrolCard ?? '',
      'ADSL Allowance': e.adslAllowance ?? '',
      'Vobi/Bele': e.vobiBele ?? '',
      'CTC': e.ctc ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, 'Employees_Export.xlsx');
  }
}
