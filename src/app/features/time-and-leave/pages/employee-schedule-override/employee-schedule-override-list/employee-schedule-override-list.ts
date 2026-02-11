import { Component, OnInit, signal, WritableSignal } from '@angular/core';
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
  loading: WritableSignal<boolean> = signal(true);
  overrides: WritableSignal<EmployeeScheduleOverride[]> = signal([]);

  constructor(private overrideService: EmployeeScheduleOverrideService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.overrideService.getAll().subscribe({
      next: (data) => {
        this.overrides.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load employee schedule overrides', err);
        this.loading.set(false);
      }
    });
  }
}