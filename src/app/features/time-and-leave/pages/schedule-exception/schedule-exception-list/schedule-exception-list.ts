import { Component, OnInit } from '@angular/core';
import { ScheduleException } from '../../../models/schedule-exception.model';
import { ScheduleExceptionService } from '../../../services/schedule-exception.service';

@Component({
  selector: 'app-schedule-exception-list',
  standalone: false,
  templateUrl: './schedule-exception-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class ScheduleExceptionListComponent implements OnInit {
  loading = true;
  exceptions: ScheduleException[] = [];

  constructor(private exceptionService: ScheduleExceptionService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.exceptionService.getAll().subscribe({
      next: (data) => {
        this.exceptions = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load schedule exceptions', err);
        this.loading = false;
      }
    });
  }
}
