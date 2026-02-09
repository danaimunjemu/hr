import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { 
  ReportsService, 
  TimesheetReport, 
  TimesheetSummaryReport, 
  PayrollReport, 
  LeaveBalanceReport, 
  LeaveReport, 
  LeaveUsageReport 
} from '../../../../time-and-leave/services/reports.service';
import { EmployeesService } from '../../../../employees/services/employees.service';
import { LeaveService } from '../../../../time-and-leave/services/leave.service';
import { Employee } from '../../../../employees/models/employee.model';
import { LeaveType } from '../../../../time-and-leave/models/leave-type.model';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styles: [`
    :host {
      display: block;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .filter-card {
      margin-bottom: 24px;
    }
    .filter-row {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    .filter-item {
      flex: 1;
      min-width: 200px;
    }
    .filter-actions {
      display: flex;
      gap: 8px;
    }
  `]
})
export class ReportsComponent implements OnInit {
  activeTab = 0; // 0: Timesheets, 1: Payroll, 2: Leaves
  loading = false;
  
  // Data
  timesheets: TimesheetReport[] = [];
  timesheetSummary: TimesheetSummaryReport[] = [];
  payroll: PayrollReport[] = [];
  leaveBalances: LeaveBalanceReport[] = [];
  leaves: LeaveReport[] = [];
  leaveUsage: LeaveUsageReport[] = [];

  // Metadata for filters
  employees: Employee[] = [];
  leaveTypes: LeaveType[] = [];

  // Filter Form
  filterForm: FormGroup;

  constructor(
    private reportsService: ReportsService,
    private employeesService: EmployeesService,
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.filterForm = this.fb.group({
      dateRange: [[]],
      employeeId: [null],
      leaveTypeId: [null]
    });
  }

  ngOnInit(): void {
    this.loadMetadata();
    // Set default date range (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.filterForm.patchValue({ dateRange: [startOfMonth, endOfMonth] });
    
    this.loadReport();
  }

  loadMetadata(): void {
    this.employeesService.getEmployees().subscribe((data: any) => this.employees = data);
    this.leaveService.getAllTypes().subscribe(data => this.leaveTypes = data);
  }

  onTabChange(index: number): void {
    this.activeTab = index;
    // Reset irrelevant filters or keep them? Keeping them is usually better UX.
    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;
    const filters = this.getFilterPayload();

    switch (this.activeTab) {
      case 0: // Timesheets
        this.loadTimesheetReports(filters);
        break;
      case 1: // Payroll
        this.reportsService.getPayroll(filters).subscribe({
          next: (data) => { this.payroll = data; this.loading = false; },
          error: () => { this.message.error('Failed to load payroll report'); this.loading = false; }
        });
        break;
      case 2: // Leaves
        this.loadLeaveReports(filters);
        break;
    }
  }

  private loadTimesheetReports(filters: any): void {
    // Load both detailed and summary for this tab, or maybe split them. 
    // For simplicity, let's load detailed timesheets by default.
    this.reportsService.getTimesheets(filters).subscribe({
      next: (data) => { this.timesheets = data; this.loading = false; },
      error: () => { this.message.error('Failed to load timesheets'); this.loading = false; }
    });
    // Also load summary if needed, but maybe separate tab or sub-section?
    this.reportsService.getTimesheetSummary(filters).subscribe({
      next: (data) => { this.timesheetSummary = data; },
      error: () => console.error('Failed to load summary')
    });
  }

  private loadLeaveReports(filters: any): void {
    this.reportsService.getLeaves(filters).subscribe({
      next: (data) => { this.leaves = data; this.loading = false; },
      error: () => { this.message.error('Failed to load leave report'); this.loading = false; }
    });
    
    // Also load balances
    this.reportsService.getLeaveBalances(filters).subscribe({
      next: (data) => { this.leaveBalances = data; },
      error: () => console.error('Failed to load balances')
    });
  }

  private getFilterPayload(): any {
    const val = this.filterForm.value;
    const payload: any = {};
    
    if (val.dateRange && val.dateRange.length === 2) {
      payload.startDate = this.dateToString(val.dateRange[0]);
      payload.endDate = this.dateToString(val.dateRange[1]);
    }
    
    if (val.employeeId) payload.employeeId = val.employeeId;
    if (val.leaveTypeId) payload.leaveTypeId = val.leaveTypeId;
    
    return payload;
  }

  private dateToString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  exportCsv(): void {
    // Mock export functionality
    this.message.success('Exporting report to CSV...');
    // Actual implementation would convert current table data to CSV blob and download
    let data: any[] = [];
    let filename = 'report.csv';

    switch (this.activeTab) {
      case 0: 
        data = this.timesheets; 
        filename = 'timesheets.csv'; 
        break;
      case 1: 
        data = this.payroll; 
        filename = 'payroll.csv'; 
        break;
      case 2: 
        data = this.leaves; 
        filename = 'leaves.csv'; 
        break;
    }

    if (!data || data.length === 0) {
      this.message.warning('No data to export');
      return;
    }

    // Simple CSV generator
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName as keyof typeof row])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  resetFilters(): void {
    this.filterForm.reset();
    // Default range again
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.filterForm.patchValue({ dateRange: [startOfMonth, endOfMonth] });
    this.loadReport();
  }
}
