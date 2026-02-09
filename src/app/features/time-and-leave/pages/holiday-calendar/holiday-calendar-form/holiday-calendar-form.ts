import { Component, OnInit } from '@angular/core';
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
  isEditMode = false;
  calendarId: number | null = null;
  loading = false;
  submitting = false;

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
        this.isEditMode = true;
        this.calendarId = +params['id'];
        this.loadCalendar(this.calendarId);
      }
    });
  }

  loadCalendar(id: number): void {
    this.loading = true;
    this.calendarService.getById(id).subscribe({
      next: (calendar) => {
        this.form.patchValue(calendar);
        this.loading = false;
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

    this.submitting = true;
    const calendarData: HolidayCalendar = {
      ...this.form.value,
      id: this.calendarId || 0
    };

    if (this.isEditMode && this.calendarId) {
      this.calendarService.update(this.calendarId, calendarData).subscribe({
        next: () => {
          this.message.success('Calendar updated successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update calendar');
          this.submitting = false;
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
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
