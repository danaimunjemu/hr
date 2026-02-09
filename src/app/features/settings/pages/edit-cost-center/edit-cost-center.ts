import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { CostCentersService } from '../../services/cost-centers.service';

@Component({
  selector: 'app-edit-cost-center',
  standalone: false,
  templateUrl: './edit-cost-center.html',
  styleUrl: './edit-cost-center.scss'
})
export class EditCostCenter implements OnInit {
  editForm!: FormGroup;
  costCenterId!: number;
  loading: WritableSignal<boolean> = signal(false);
  saving: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private costCentersService: CostCentersService,
    private message: NzMessageService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.costCenterId = +id;
      this.fetchCostCenter(this.costCenterId);
    } else {
      this.error.set('Invalid cost center ID');
    }
  }

  createForm(): void {
    this.editForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  fetchCostCenter(id: number): void {
    this.loading.set(true);
    this.costCentersService.getCostCenter(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.editForm.patchValue({
            name: data.name
          });
        },
        error: (err) => this.error.set(err.message)
      });
  }

  submitForm(): void {
    if (this.editForm.valid) {
      this.saving.set(true);
      const payload = { ...this.editForm.value, id: this.costCenterId };
      
      this.costCentersService.updateCostCenter(this.costCenterId, payload)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => {
            this.message.success('Cost Center updated successfully');
            this.router.navigate(['/app/settings/cost-centers']);
          },
          error: (err) => {
            this.message.error(err.message || 'Failed to update cost center');
          }
        });
    } else {
      Object.values(this.editForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/app/settings/cost-centers']);
  }
}
