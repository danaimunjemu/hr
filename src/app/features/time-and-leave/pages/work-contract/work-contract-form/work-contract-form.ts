import { Component, inject, signal, effect, computed, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkContractService } from '../../../services/work-contract.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WorkContract } from '../../../models/work-contract.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-work-contract-form',
  standalone: false,
  templateUrl: './work-contract-form.html',
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class WorkContractFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(WorkContractService);
  private message = inject(NzMessageService);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    normalHoursPerDay: [8, [Validators.required, Validators.min(0)]],
    normalHoursPerWeek: [40, [Validators.required, Validators.min(0)]],
    overtimePolicy: ['DAILY', [Validators.required]],
    overtimeDailyThreshold: [0, [Validators.required, Validators.min(0)]],
    overtimeWeeklyThreshold: [0, [Validators.required, Validators.min(0)]],
    roundingMinutes: [0, [Validators.required, Validators.min(0)]]
  });

  isEditMode = signal(false);
  contractId = signal<number | null>(null);
  submitting = signal(false);

  // Load contract data when ID is present
  private contractData = toSignal(
    this.route.params.pipe(
      map(params => params['id']),
      filter(id => !!id),
      tap(id => {
        this.isEditMode.set(true);
        this.contractId.set(+id);
      }),
      switchMap(id => this.service.getById(+id))
    )
  );

  // Effect to patch form when data loads
  constructor() {
    effect(() => {
      const data = this.contractData();
      if (data) {
        this.form.patchValue(data);
      }
    });
  }

  // Derived loading state
  // If we are in edit mode (ID exists) but data hasn't loaded yet, we are loading.
  loading = computed(() => this.isEditMode() && !this.contractData());

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
    const contractData: WorkContract = this.form.value;
    const id = this.contractId();

    const request$ = (this.isEditMode() && id)
      ? this.service.update(id, contractData)
      : this.service.create(contractData);

    request$.subscribe({
      next: () => {
        this.message.success(this.isEditMode() ? 'Work contract updated successfully' : 'Work contract created successfully');
        this.router.navigate(['../../'], { relativeTo: this.route });
      },
      error: () => {
        this.message.error(this.isEditMode() ? 'Failed to update work contract' : 'Failed to create work contract');
        this.submitting.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}