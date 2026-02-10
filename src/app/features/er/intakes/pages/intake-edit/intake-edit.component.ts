import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ErIntakeService } from '../../services/er-intake.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-intake-edit',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">Triage Intake #{{ intakeId }}</h1>
    </div>

    <nz-card>
      <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
        
        <nz-form-item>
          <nz-form-label nzRequired>Triage Decision</nz-form-label>
          <nz-form-control nzErrorTip="Required">
            <nz-select formControlName="triageDecision" nzPlaceHolder="Select decision">
              <nz-option nzValue="PROCEED" nzLabel="Proceed"></nz-option>
              <nz-option nzValue="INVESTIGATE" nzLabel="Investigate"></nz-option>
              <nz-option nzValue="MEDIATE" nzLabel="Mediate"></nz-option>
              <nz-option nzValue="DISMISS" nzLabel="Dismiss"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label>Triage Notes</nz-form-label>
          <nz-form-control>
            <textarea nz-input formControlName="triageNotes" rows="4" placeholder="Rationale for decision..."></textarea>
          </nz-form-control>
        </nz-form-item>

        <div class="flex justify-end gap-2">
          <button nz-button type="button" (click)="cancel()">Cancel</button>
          <button nz-button nzType="primary" type="submit" [nzLoading]="loading">Update Triage</button>
        </div>
      </form>
    </nz-card>
  `
})
export class IntakeEditComponent implements OnInit {
  form: FormGroup;
  loading = false;
  intakeId!: number;

  constructor(
    private fb: FormBuilder,
    private intakeService: ErIntakeService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      triageDecision: [null, [Validators.required]],
      triageNotes: [null]
    });
  }

  ngOnInit(): void {
    this.intakeId = +this.route.snapshot.params['id'];
    this.loadIntake();
  }

  loadIntake(): void {
    this.loading = true;
    this.intakeService.getIntake(this.intakeId).subscribe({
      next: (data) => {
        this.form.patchValue({
          triageDecision: data.triageDecision,
          triageNotes: data.triageNotes
        });
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load intake');
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;
      const val = this.form.value;
      const payload = {
        id: this.intakeId,
        triageDecision: val.triageDecision,
        triageNotes: val.triageNotes
      };

      this.intakeService.updateIntake(payload).subscribe({
        next: () => {
          this.message.success('Intake triage updated');
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: () => {
          this.message.error('Failed to update intake');
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
