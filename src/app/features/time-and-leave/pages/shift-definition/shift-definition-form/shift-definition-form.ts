import { Component, inject, signal, effect, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShiftDefinitionService } from '../../../services/shift-definition.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ShiftDefinition } from '../../../models/shift-definition.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap, tap } from 'rxjs';

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
export class ShiftDefinitionFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ShiftDefinitionService);
  private message = inject(NzMessageService);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    code: ['', [Validators.required]],
    startTime: [null, [Validators.required]],
    endTime: [null, [Validators.required]],
    breakMinutes: [60, [Validators.required, Validators.min(0)]],
    paidHours: [8, [Validators.required, Validators.min(0)]],
    nightShift: [false],
    weekendShift: [false]
  });

  isEditMode = signal(false);
  shiftId = signal<number | null>(null);
  submitting = signal(false);

  private shiftData = toSignal(
    this.route.params.pipe(
      map(params => params['id']),
      filter(id => !!id),
      tap(id => {
        this.isEditMode.set(true);
        this.shiftId.set(+id);
      }),
      switchMap(id => this.service.getById(+id))
    )
  );

  loading = computed(() => this.isEditMode() && !this.shiftData());

  constructor() {
    effect(() => {
      const shift = this.shiftData();
      if (shift) {
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

    const id = this.shiftId();
    const request$ = (this.isEditMode() && id)
      ? this.service.update(id, shiftData)
      : this.service.create(shiftData);

    request$.subscribe({
      next: () => {
        this.message.success(this.isEditMode() ? 'Shift definition updated successfully' : 'Shift definition created successfully');
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: () => {
        this.message.error(this.isEditMode() ? 'Failed to update shift definition' : 'Failed to create shift definition');
        this.submitting.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
