import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OhsService } from '../../services/ohs.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-induction-form',
  standalone: false,
  template: `
    <nz-page-header (nzBack)="onBack()" nzBackIcon [nzTitle]="id ? 'Edit Induction' : 'New Induction'"></nz-page-header>
    
    <nz-card>
      <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
        <nz-form-item>
          <nz-form-label nzRequired>Title</nz-form-label>
          <nz-form-control nzErrorTip="Required">
            <input nz-input formControlName="title" />
          </nz-form-control>
        </nz-form-item>

        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Valid From</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-date-picker formControlName="validFrom" style="width: 100%"></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Valid Until</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-date-picker formControlName="validUntil" style="width: 100%"></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>

        <nz-form-item>
          <nz-form-label>Description</nz-form-label>
          <nz-form-control>
            <textarea nz-input formControlName="description" rows="4"></textarea>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label>Required For Roles (Comma separated)</nz-form-label>
          <nz-form-control>
            <input nz-input formControlName="requiredForRoles" placeholder="e.g. Welder, Electrician" />
          </nz-form-control>
        </nz-form-item>

        <div class="flex justify-end gap-2">
          <button nz-button type="button" (click)="onBack()">Cancel</button>
          <button nz-button nzType="primary" [nzLoading]="loading">Save</button>
        </div>
      </form>
    </nz-card>
  `
})
export class InductionFormComponent implements OnInit {
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
      title: ['', [Validators.required]],
      description: [''],
      validFrom: [new Date(), [Validators.required]],
      validUntil: [null, [Validators.required]],
      requiredForRoles: ['']
    });
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.ohsService.getInduction(this.id).subscribe(data => {
        this.form.patchValue({
          ...data,
          validFrom: new Date(data.validFrom),
          validUntil: new Date(data.validUntil),
          requiredForRoles: data.requiredForRoles.join(', ')
        });
      });
    }
  }

  submit() {
    if (this.form.valid) {
      this.loading = true;
      const val = this.form.value;
      const payload = {
        ...val,
        validFrom: val.validFrom.toISOString(),
        validUntil: val.validUntil.toISOString(),
        requiredForRoles: val.requiredForRoles.split(',').map((r: string) => r.trim()).filter((r: string) => r)
      };

      const request = this.id 
        ? this.ohsService.updateInduction(this.id, payload)
        : this.ohsService.createInduction(payload);

      request.subscribe({
        next: () => {
          this.message.success('Induction saved');
          this.onBack();
        },
        error: () => {
          this.message.error('Failed to save');
          this.loading = false;
        }
      });
    }
  }

  onBack() {
    this.router.navigate(['/app/health-and-safety/inductions']);
  }
}
