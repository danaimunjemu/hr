import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { CostCentersService } from '../../services/cost-centers.service';

@Component({
  selector: 'app-create-cost-center',
  standalone: false,
  templateUrl: './create-cost-center.html',
  styleUrl: './create-cost-center.scss'
})
export class CreateCostCenter {
  createForm: FormGroup;
  loading: WritableSignal<boolean> = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private costCentersService: CostCentersService,
    private message: NzMessageService
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  submitForm(): void {
    if (this.createForm.valid) {
      this.loading.set(true);
      this.costCentersService.createCostCenter(this.createForm.value)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: () => {
            this.message.success('Cost Center created successfully');
            this.router.navigate(['/app/settings/cost-centers']);
          },
          error: (err) => {
            this.message.error(err.message || 'Failed to create cost center');
          }
        });
    } else {
      Object.values(this.createForm.controls).forEach(control => {
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
