import { Component, OnInit, signal, computed, effect, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OhsService } from '../../services/ohs.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Induction } from '../../models/ohs.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-induction-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-page-header (nzBack)="onBack()" nzBackIcon [nzTitle]="isEdit() ? 'Edit Induction' : 'New Induction'">
      <nz-page-header-extra>
        <nz-tag [nzColor]="statusColor()">{{ currentStatus() }}</nz-tag>
      </nz-page-header-extra>
    </nz-page-header>
    
    <div class="p-6">
      <nz-card>
        <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="16">
              <nz-form-item>
                <nz-form-label nzRequired>Title</nz-form-label>
                <nz-form-control nzErrorTip="Required">
                  <input nz-input formControlName="title" />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="8">
              <nz-form-item>
                <nz-form-label>Status</nz-form-label>
                <nz-form-control>
                  <nz-select formControlName="status">
                    <nz-option nzValue="SCHEDULED" nzLabel="Scheduled"></nz-option>
                    <nz-option nzValue="IN_PROGRESS" nzLabel="In Progress"></nz-option>
                    <nz-option nzValue="COMPLETED" nzLabel="Completed"></nz-option>
                    <nz-option nzValue="CANCELLED" nzLabel="Cancelled"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

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
            <button *ngIf="canEdit()" nz-button nzType="primary" [nzLoading]="loading()">Save</button>
          </div>
        </form>
      </nz-card>
    </div>
  `
})
export class InductionFormComponent implements OnInit {
  form: FormGroup;
  
  loading = signal(false);
  induction = signal<Induction | null>(null);
  isEdit = computed(() => !!this.induction());
  currentStatus = computed(() => this.induction()?.status || 'SCHEDULED');
  
  // Allow updates only in SCHEDULED or IN_PROGRESS
  canEdit = computed(() => {
    const status = this.currentStatus();
    return !this.induction() || status === 'SCHEDULED' || status === 'IN_PROGRESS';
  });

  statusColor = computed(() => {
    switch (this.currentStatus()) {
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      case 'IN_PROGRESS': return 'processing';
      default: return 'blue';
    }
  });

  constructor(
    private fb: FormBuilder,
    private ohsService: OhsService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      validFrom: [new Date(), [Validators.required]],
      validUntil: [null, [Validators.required]],
      requiredForRoles: [''],
      status: ['SCHEDULED', [Validators.required]]
    });

    effect(() => {
      if (!this.canEdit()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading.set(true);
      this.ohsService.getInduction(id)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (data) => {
            this.induction.set(data);
            this.form.patchValue({
              ...data,
              validFrom: new Date(data.validFrom),
              validUntil: new Date(data.validUntil),
              requiredForRoles: data.requiredForRoles.join(', ')
            });
            this.cdr.markForCheck();
          },
          error: () => this.message.error('Failed to load induction')
        });
    }
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      const val = this.form.value;
      const payload = {
        ...val,
        validFrom: val.validFrom.toISOString(),
        validUntil: val.validUntil.toISOString(),
        requiredForRoles: val.requiredForRoles.split(',').map((r: string) => r.trim()).filter((r: string) => r)
      };

      const request = this.induction()?.id 
        ? this.ohsService.updateInduction(this.induction()!.id, payload)
        : this.ohsService.createInduction(payload);

      request.pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (res) => {
            this.message.success('Induction saved');
            this.onBack();
          },
          error: () => this.message.error('Failed to save')
        });
    }
  }

  onBack() {
    this.router.navigate(['/app/health-and-safety/inductions']);
  }
}
