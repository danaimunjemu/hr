import { Component, OnInit } from '@angular/core';
import { EmployeeScheduleOverride } from '../../../models/employee-schedule-override.model';
import { EmployeeScheduleOverrideService } from '../../../services/employee-schedule-override.service';

@Component({
  selector: 'app-employee-schedule-override-list',
  standalone: false,
  templateUrl: './employee-schedule-override-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class EmployeeScheduleOverrideListComponent implements OnInit {
  loading = true;
  overrides: EmployeeScheduleOverride[] = [];

  constructor(private overrideService: EmployeeScheduleOverrideService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.overrideService.getAll().subscribe({
      next: (data) => {
        this.overrides = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load employee schedule overrides', err);
        this.loading = false;
      }
    });
  }
}
