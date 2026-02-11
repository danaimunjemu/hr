import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HolidayCalendarService } from '../../../services/holiday-calendar.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HolidayCalendar, HolidayDate } from '../../../models/holiday-calendar.model';

@Component({
  selector: 'app-holiday-calendar-view',
  standalone: false,
  templateUrl: './holiday-calendar-view.html',
  styles: [`
    :host {
      display: block;
    }
    .date-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
  `]
})
export class HolidayCalendarViewComponent implements OnInit {
  calendar: WritableSignal<HolidayCalendar | null> = signal(null);
  loading: WritableSignal<boolean> = signal(true);
  isDateModalVisible: WritableSignal<boolean> = signal(false);
  isSubmittingDate: WritableSignal<boolean> = signal(false);
  dateForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private calendarService: HolidayCalendarService,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {
    this.dateForm = this.fb.group({
      name: ['', [Validators.required]],
      date: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadCalendar(+params['id']);
      }
    });
  }

  loadCalendar(id: number): void {
    this.loading.set(true);
    this.calendarService.getById(id).subscribe({
      next: (data) => {
        this.calendar.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.message.error('Failed to load calendar');
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  showAddDateModal(): void {
    this.dateForm.reset();
    this.isDateModalVisible.set(true);
  }

  handleDateCancel(): void {
    this.isDateModalVisible.set(false);
  }

  handleDateSubmit(): void {
    const calendar = this.calendar();
    if (this.dateForm.invalid || !calendar) {
      Object.values(this.dateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isSubmittingDate.set(true);
    const formValue = this.dateForm.value;
    
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    const newDate: HolidayDate = {
      id: 0,
      name: formValue.name,
      date: formatDate(formValue.date),
      holidayCalendar: { id: calendar.id } as any
    };

    this.calendarService.addDate(newDate).subscribe({
      next: () => {
        this.message.success('Holiday date added');
        this.isDateModalVisible.set(false);
        this.isSubmittingDate.set(false);
        const currentCalendar = this.calendar();
        if (currentCalendar) {
            this.loadCalendar(currentCalendar.id); // Refresh to show new date
        }
      },
      error: () => {
        this.message.error('Failed to add holiday date');
        this.isSubmittingDate.set(false);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
