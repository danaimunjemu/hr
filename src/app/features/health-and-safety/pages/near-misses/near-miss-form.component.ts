import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OhsService } from '../../services/ohs.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-near-miss-form',
  standalone: false,
  template: `
    <nz-page-header (nzBack)="onBack()" nzBackIcon nzTitle="Report Near Miss"></nz-page-header>
    
    <nz-card>
      <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Incident Date</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-date-picker formControlName="incidentDate" style="width: 100%"></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Location</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <input nz-input formControlName="location" />
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>

        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Potential Severity</nz-form-label>
              <nz-form-control>
                <nz-select formControlName="potentialSeverity">
                  <nz-option nzValue="LOW" nzLabel="Low"></nz-option>
                  <nz-option nzValue="MEDIUM" nzLabel="Medium"></nz-option>
                  <nz-option nzValue="HIGH" nzLabel="High"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>

        <nz-form-item>
          <nz-form-label nzRequired>Description</nz-form-label>
          <nz-form-control nzErrorTip="Required">
            <textarea nz-input formControlName="description" rows="4"></textarea>
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
export class NearMissFormComponent implements OnInit {
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
      incidentDate: [new Date(), [Validators.required]],
      location: ['', [Validators.required]],
      potentialSeverity: ['LOW', [Validators.required]],
      description: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.ohsService.getNearMissReport(this.id).subscribe(data => {
        this.form.patchValue({
          ...data,
          incidentDate: new Date(data.incidentDate)
        });
      });
    }
  }

  submit() {
    if (this.form.valid) {
      this.loading = true;
      const payload = { ...this.form.value, incidentDate: this.form.value.incidentDate.toISOString() };
      
      this.ohsService.submitNearMissReport(payload).subscribe({
        next: () => {
          this.message.success('Report submitted');
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
    const payload = { ...this.form.value, incidentDate: this.form.value.incidentDate.toISOString() };
    this.ohsService.draftNearMissReport(payload).subscribe({
      next: () => {
        this.message.success('Draft saved');
        this.onBack();
      },
      error: () => this.message.error('Failed to save draft')
    });
  }

  onBack() {
    this.router.navigate(['/app/health-and-safety/near-misses']);
  }
}
