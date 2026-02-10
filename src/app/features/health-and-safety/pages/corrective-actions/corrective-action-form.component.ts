import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OhsService } from '../../services/ohs.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-corrective-action-form',
  standalone: false,
  template: `
    <nz-page-header (nzBack)="onBack()" nzBackIcon [nzTitle]="id ? 'Edit Corrective Action' : 'New Corrective Action'"></nz-page-header>
    
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
          <button nz-button nzType="primary" [nzLoading]="loading">Save</button>
        </div>
      </form>
    </nz-card>
  `
})
export class CorrectiveActionFormComponent implements OnInit {
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
      description: ['', [Validators.required]],
      assignedTo: ['', [Validators.required]],
      dueDate: [new Date(), [Validators.required]],
      status: ['OPEN', [Validators.required]],
      incidentId: ['']
    });
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.ohsService.getCorrectiveAction(this.id).subscribe(data => {
        this.form.patchValue({
          ...data,
          dueDate: new Date(data.dueDate)
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
        dueDate: val.dueDate.toISOString()
      };

      const request = this.id 
        ? this.ohsService.updateCorrectiveAction(this.id, payload)
        : this.ohsService.createCorrectiveAction(payload);

      request.subscribe({
        next: () => {
          this.message.success('Action saved');
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
    this.router.navigate(['/app/health-and-safety/corrective-actions']);
  }
}
