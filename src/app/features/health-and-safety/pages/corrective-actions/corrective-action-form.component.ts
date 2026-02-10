import { Component, OnInit, signal, computed, effect, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OhsService } from '../../services/ohs.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CorrectiveAction } from '../../models/ohs.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-corrective-action-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-page-header (nzBack)="onBack()" nzBackIcon [nzTitle]="isEdit() ? 'Edit Corrective Action' : 'New Corrective Action'">
      <nz-page-header-extra>
        <nz-tag [nzColor]="statusColor()">{{ currentStatus() }}</nz-tag>
        <nz-tag *ngIf="isVerified()" [nzColor]="'green'">VERIFIED</nz-tag>
      </nz-page-header-extra>
    </nz-page-header>
    
    <div class="p-6">
      <nz-card>
        <form nz-form [formGroup]="form" (ngSubmit)="submit()" nzLayout="vertical">
          <nz-form-item>
            <nz-form-label nzRequired>Description</nz-form-label>
            <nz-form-control nzErrorTip="Required">
              <textarea nz-input formControlName="description" rows="3"></textarea>
            </nz-form-control>
          </nz-form-item>

          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label nzRequired>Assigned To (Employee ID)</nz-form-label>
                <nz-form-control nzErrorTip="Required">
                  <input nz-input formControlName="assignedTo" />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label nzRequired>Due Date</nz-form-label>
                <nz-form-control nzErrorTip="Required">
                  <nz-date-picker formControlName="dueDate" style="width: 100%"></nz-date-picker>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label nzRequired>Status</nz-form-label>
                <nz-form-control>
                  <nz-select formControlName="status">
                    <nz-option nzValue="OPEN" nzLabel="Open"></nz-option>
                    <nz-option nzValue="IN_PROGRESS" nzLabel="In Progress"></nz-option>
                    <nz-option nzValue="PENDING_VERIFICATION" nzLabel="Pending Verification"></nz-option>
                    <nz-option nzValue="VERIFIED" nzLabel="Verified"></nz-option>
                    <nz-option nzValue="CLOSED" nzLabel="Closed"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label>Incident ID (Optional)</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="incidentId" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button nz-button type="button" (click)="onBack()">Cancel</button>
            <button *ngIf="canEdit()" nz-button nzType="primary" [nzLoading]="loading()">Save</button>
          </div>
        </form>
      </nz-card>
    </div>
  `
})
export class CorrectiveActionFormComponent implements OnInit {
  form: FormGroup;
  
  loading = signal(false);
  action = signal<CorrectiveAction | null>(null);
  isEdit = computed(() => !!this.action());
  currentStatus = computed(() => this.action()?.status || 'OPEN');
  isVerified = computed(() => !!this.action()?.verified);
  
  // Editable until verified === true
  canEdit = computed(() => !this.action() || !this.action()?.verified);

  statusColor = computed(() => {
    switch (this.currentStatus()) {
      case 'VERIFIED': return 'green';
      case 'CLOSED': return 'gray';
      case 'IN_PROGRESS': return 'blue';
      case 'PENDING_VERIFICATION': return 'orange';
      default: return 'default';
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
      description: ['', [Validators.required]],
      assignedTo: ['', [Validators.required]],
      dueDate: [new Date(), [Validators.required]],
      status: ['OPEN', [Validators.required]],
      incidentId: ['']
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
      this.ohsService.getCorrectiveAction(id)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (data) => {
            this.action.set(data);
            this.form.patchValue({
              ...data,
              dueDate: new Date(data.dueDate)
            });
            this.cdr.markForCheck();
          },
          error: () => this.message.error('Failed to load action')
        });
    }
  }

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      const val = this.form.value;
      const payload = {
        ...val,
        dueDate: val.dueDate.toISOString(),
        verified: val.status === 'VERIFIED' // Auto-set verified flag if status is VERIFIED
      };

      const request = this.action()?.id 
        ? this.ohsService.updateCorrectiveAction(this.action()!.id, payload)
        : this.ohsService.createCorrectiveAction(payload);

      request.pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (res) => {
            this.message.success('Action saved');
            this.onBack();
          },
          error: () => this.message.error('Failed to save')
        });
    }
  }

  onBack() {
    this.router.navigate(['/app/health-and-safety/corrective-actions']);
  }
}
