import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ErOutcomeService } from '../../services/er-outcome.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-outcome-edit',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">Update Communication Status</h1>
    </div>

    <nz-card>
      <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
        
        <nz-form-item>
          <nz-form-label>Communicated At</nz-form-label>
          <nz-form-control>
            <nz-date-picker formControlName="communicatedAt" nzShowTime style="width: 100%"></nz-date-picker>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label>Communication Notes</nz-form-label>
          <nz-form-control>
            <textarea nz-input formControlName="communicationNotes" rows="4" placeholder="Details of communication to employee..."></textarea>
          </nz-form-control>
        </nz-form-item>

        <div class="flex justify-end gap-2">
          <button nz-button type="button" (click)="cancel()">Cancel</button>
          <button nz-button nzType="primary" type="submit" [nzLoading]="loading()">Update Status</button>
        </div>
      </form>
    </nz-card>
  `
})
export class OutcomeEditComponent implements OnInit {
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(false);
  outcomeId!: number;

  constructor(
    private fb: FormBuilder,
    private outcomeService: ErOutcomeService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      communicatedAt: [null, [Validators.required]],
      communicationNotes: [null]
    });
  }

  ngOnInit(): void {
    this.outcomeId = +this.route.snapshot.params['id'];
    this.loadOutcome();
  }

  loadOutcome(): void {
    this.loading.set(true);
    this.outcomeService.getOutcome(this.outcomeId).subscribe({
      next: (data) => {
        this.form.patchValue({
          communicatedAt: data.communicatedAt ? new Date(data.communicatedAt) : null,
          communicationNotes: data.communicationNotes
        });
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Failed to load outcome');
        this.loading.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading.set(true);
      const val = this.form.value;
      const payload = {
        id: this.outcomeId,
        communicatedAt: val.communicatedAt ? val.communicatedAt.toISOString() : null,
        communicationNotes: val.communicationNotes
      };

      this.outcomeService.updateOutcome(payload).subscribe({
        next: () => {
          this.message.success('Outcome communication updated');
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update outcome');
          this.loading.set(false);
        }
      });
    } else {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
