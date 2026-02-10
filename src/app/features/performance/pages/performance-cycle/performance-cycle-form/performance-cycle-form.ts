import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PerformanceCycleService } from '../../../services/performance-cycle.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PerformanceCycle } from '../../../models/performance-cycle.model';

@Component({
  selector: 'app-performance-cycle-form',
  standalone: false,
  templateUrl: './performance-cycle-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class PerformanceCycleFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  cycleId: number | null = null;
  loading: WritableSignal<boolean> = signal(false);
  submitting: WritableSignal<boolean> = signal(false);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private performanceCycleService: PerformanceCycleService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      active: [true]
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return { dateRange: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.cycleId = +params['id'];
        this.loadCycle(this.cycleId);
      }
    });
  }

  loadCycle(id: number): void {
    this.loading.set(true);
    this.performanceCycleService.getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (cycle) => {
          this.form.patchValue({
            name: cycle.name,
            startDate: cycle.startDate,
            endDate: cycle.endDate,
            active: cycle.active
          });
        },
        error: (err: any) => {
          this.message.error('Failed to load performance cycle');
          this.router.navigate(['/app/performance/performance-cycle']);
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

    if (this.form.errors?.['dateRange']) {
      this.message.error('End date must be greater than or equal to start date');
      return;
    }

    this.submitting.set(true);
    const formValue = this.form.value;

    const cycleData: PerformanceCycle = {
      name: formValue.name,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      active: formValue.active
    };

    const request$ = this.isEditMode && this.cycleId
      ? this.performanceCycleService.update(this.cycleId, cycleData)
      : this.performanceCycleService.create(cycleData);

    request$
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.message.success(`Performance cycle ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.router.navigate(['/app/performance/performance-cycle']);
        },
        error: () => {
          this.message.error(`Failed to ${this.isEditMode ? 'update' : 'create'} performance cycle`);
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/app/performance/performance-cycle']);
  }
}
