import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShiftDefinitionService } from '../../../services/shift-definition.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ShiftDefinition } from '../../../models/shift-definition.model';

@Component({
  selector: 'app-shift-definition-form',
  standalone: false,
  templateUrl: './shift-definition-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class ShiftDefinitionFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  shiftId: number | null = null;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private shiftDefinitionService: ShiftDefinitionService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      code: ['', [Validators.required]],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      breakMinutes: [60, [Validators.required, Validators.min(0)]],
      paidHours: [8, [Validators.required, Validators.min(0)]],
      nightShift: [false],
      weekendShift: [false]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.shiftId = +params['id'];
        this.loadShift(this.shiftId);
      }
    });
  }

  loadShift(id: number): void {
    this.loading = true;
    this.shiftDefinitionService.getById(id).subscribe({
      next: (shift) => {
        let startTimeDate = null;
        if (shift.startTime) {
            const [hours, minutes] = shift.startTime.split(':');
            startTimeDate = new Date();
            startTimeDate.setHours(+hours, +minutes, 0, 0);
        }

        let endTimeDate = null;
        if (shift.endTime) {
            const [hours, minutes] = shift.endTime.split(':');
            endTimeDate = new Date();
            endTimeDate.setHours(+hours, +minutes, 0, 0);
        }

        this.form.patchValue({
          ...shift,
          startTime: startTimeDate,
          endTime: endTimeDate
        });
        
        this.loading = false;
      },
      error: (err: any) => {
        this.message.error('Failed to load shift details');
        this.loading = false;
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
    const formValue = this.form.value;

    const formatTime = (date: Date): string => {
        if (!date) return '';
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const shiftData: ShiftDefinition = {
      ...formValue,
      startTime: formatTime(formValue.startTime),
      endTime: formatTime(formValue.endTime),
    };

    if (this.isEditMode && this.shiftId) {
      this.shiftDefinitionService.update(this.shiftId, shiftData).subscribe({
        next: () => {
          this.message.success('Shift definition updated successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update shift definition');
          this.submitting = false;
        }
      });
    } else {
      this.shiftDefinitionService.create(shiftData).subscribe({
        next: () => {
          this.message.success('Shift definition created successfully');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to create shift definition');
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
