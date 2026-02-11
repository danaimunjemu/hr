import { Component, OnInit, signal, WritableSignal } from '@angular/core';
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
  loading: WritableSignal<boolean> = signal(true);
  exceptions: WritableSignal<ScheduleException[]> = signal([]);

  constructor(private exceptionService: ScheduleExceptionService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.exceptionService.getAll().subscribe({
      next: (data) => {
        this.exceptions.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load schedule exceptions', err);
        this.loading.set(false);
      }
    });
  }
}