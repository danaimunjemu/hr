import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { HolidayCalendar } from '../../../models/holiday-calendar.model';
import { HolidayCalendarService } from '../../../services/holiday-calendar.service';

@Component({
  selector: 'app-holiday-calendar-list',
  standalone: false,
  templateUrl: './holiday-calendar-list.html',
  styles: [`
    :host {
      display: block;
    }
    .action-btn {
      margin-right: 8px;
    }
  `]
})
export class HolidayCalendarListComponent implements OnInit {
  loading: WritableSignal<boolean> = signal(true);
  calendars: WritableSignal<HolidayCalendar[]> = signal([]);

  constructor(private calendarService: HolidayCalendarService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.calendarService.getAll().subscribe({
      next: (data) => {
        this.calendars.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load holiday calendars', err);
        this.loading.set(false);
      }
    });
  }
}