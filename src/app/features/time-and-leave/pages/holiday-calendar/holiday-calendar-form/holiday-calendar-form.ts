import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HolidayCalendarService } from '../../../services/holiday-calendar.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HolidayCalendar } from '../../../models/holiday-calendar.model';

@Component({
  selector: 'app-holiday-calendar-form',
  standalone: false,
  templateUrl: './holiday-calendar-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 600px;
      margin: 0 auto;
    }
  `]
})
export class HolidayCalendarFormComponent implements OnInit {
  form: FormGroup;
  isEditMode: WritableSignal<boolean> = signal(false);
  calendarId: WritableSignal<number | null> = signal(null);
  loading: WritableSignal<boolean> = signal(false);
  submitting: WritableSignal<boolean> = signal(false);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private calendarService: HolidayCalendarService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        const id = +params['id'];
        this.isEditMode.set(true);
        this.calendarId.set(id);
        this.loadCalendar(id);
      }
    });
  }

  loadCalendar(id: number): void {
    this.loading.set(true);
    this.calendarService.getById(id).subscribe({
      next: (calendar) => {
        this.form.patchValue(calendar);
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Failed to load calendar');
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.submitting.set(true);
    const calendarData: HolidayCalendar = {
      ...this.form.value,
      id: this.calendarId() || 0
    };

    const calendarId = this.calendarId();
    if (this.isEditMode() && calendarId !== null) {
      this.calendarService.update(calendarId, calendarData).subscribe({
        next: () => {
          this.message.success('Calendar updated successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update calendar');
          this.submitting.set(false);
        }
      });
    } else {
      this.calendarService.create(calendarData).subscribe({
        next: () => {
          this.message.success('Calendar created successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to create calendar');
          this.submitting.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
