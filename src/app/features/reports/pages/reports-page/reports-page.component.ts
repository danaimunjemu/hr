import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-reports-page',
  standalone: false,
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss'
})
export class ReportsPageComponent implements OnInit {
  loading = false;
  error: string | null = null;
  
  reportCategories = [
    {
      name: 'Employee Reports',
      icon: 'team',
      reports: ['Headcount Report', 'Diversity & Inclusion', 'Turnover Rate', 'New Hires']
    },
    {
      name: 'Time & Attendance',
      icon: 'clock-circle',
      reports: ['Absence Report', 'Overtime Analysis', 'Timesheet Summary', 'Late Arrivals']
    },
    {
      name: 'Payroll & Benefits',
      icon: 'dollar',
      reports: ['Payroll Summary', 'Benefits Utilization', 'Salary Distribution', 'Tax Deductions']
    }
  ];

  recentReports = [
    { name: 'Monthly Payroll - Jan 2026', user: 'Admin User', date: '2026-02-01 09:30', status: 'Ready' },
    { name: 'Q4 2025 Performance Review', user: 'HR Manager', date: '2026-01-15 14:20', status: 'Ready' },
    { name: 'Turnover Analysis 2025', user: 'Director', date: '2026-02-06 10:00', status: 'Processing' }
  ];

  constructor(private msg: NzMessageService) {}

  ngOnInit(): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 800);
  }

  generateReport(name: string): void {
    this.msg.info(`Generating ${name}...`);
  }
}
