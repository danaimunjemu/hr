import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OhsService } from '../../services/ohs.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-medical-surveillance-form',
  standalone: false,
  template: `
    <nz-page-header (nzBack)="onBack()" nzBackIcon nzTitle="Medical Surveillance Record"></nz-page-header>
    
    <nz-card>
      <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Employee ID</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <input nz-input formControlName="employeeId" />
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Checkup Date</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-date-picker formControlName="checkupDate" style="width: 100%"></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>

        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Type</nz-form-label>
              <nz-form-control>
                <nz-select formControlName="type">
                  <nz-option nzValue="Pre-employment" nzLabel="Pre-employment"></nz-option>
                  <nz-option nzValue="Annual" nzLabel="Annual"></nz-option>
                  <nz-option nzValue="Exit" nzLabel="Exit"></nz-option>
                  <nz-option nzValue="Return to Work" nzLabel="Return to Work"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Result</nz-form-label>
              <nz-form-control>
                <nz-select formControlName="result">
                  <nz-option nzValue="Fit" nzLabel="Fit"></nz-option>
                  <nz-option nzValue="Unfit" nzLabel="Unfit"></nz-option>
                  <nz-option nzValue="Fit with Restrictions" nzLabel="Fit with Restrictions"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>

        <nz-form-item>
          <nz-form-label>Notes</nz-form-label>
          <nz-form-control>
            <textarea nz-input formControlName="notes" rows="4"></textarea>
          </nz-form-control>
        </nz-form-item>

        <div class="flex justify-end gap-2">
          <button nz-button type="button" (click)="onBack()">Cancel</button>
          <button nz-button nzType="default" (click)="saveDraft()">Save Draft</button>
          <button nz-button nzType="primary" [nzLoading]="loading">Submit</button>
        </div>
      </form>
    </nz-card>
  `
})
export class MedicalSurveillanceFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  id: string | null = null;

  constructor(
    private fb: FormBuilder,
    private ohsService: OhsService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      employeeId: ['', [Validators.required]],
      checkupDate: [new Date(), [Validators.required]],
      type: ['Annual', [Validators.required]],
      result: ['Fit', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.ohsService.getMedicalSurveillance(this.id).subscribe(data => {
        this.form.patchValue({
          ...data,
          checkupDate: new Date(data.checkupDate)
        });
      });
    }
  }

  submit() {
    if (this.form.valid) {
      this.loading = true;
      const payload = { ...this.form.value, checkupDate: this.form.value.checkupDate.toISOString() };
      
      this.ohsService.submitMedicalSurveillance(payload).subscribe({
        next: () => {
          this.message.success('Record submitted');
          this.onBack();
        },
        error: () => {
          this.message.error('Failed to submit');
          this.loading = false;
        }
      });
    }
  }

  saveDraft() {
    const payload = { ...this.form.value, checkupDate: this.form.value.checkupDate.toISOString() };
    this.ohsService.draftMedicalSurveillance(payload).subscribe({
      next: () => {
        this.message.success('Draft saved');
        this.onBack();
      },
      error: () => this.message.error('Failed to save draft')
    });
  }

  onBack() {
    this.router.navigate(['/app/health-and-safety/medical']);
  }
}
