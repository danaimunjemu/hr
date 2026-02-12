import { Component, OnInit, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OhsService } from '../../services/ohs.service';
import { EmployeesService } from '../../../employees/services/employees.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SafetyIncident, OhsWorkflowStatus, IncidentType, InjuryType, ActionStatus } from '../../models/ohs.model';
import { Employee } from '../../../employees/services/employees.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-safety-incident-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-page-header (nzBack)="onBack()" nzBackIcon [nzTitle]="isEdit() ? 'Incident Details' : 'Report Safety Incident'">
      <nz-page-header-extra>
        <nz-tag [nzColor]="statusColor()">{{ currentStatus() }}</nz-tag>
      </nz-page-header-extra>
    </nz-page-header>
    
    <div class="p-6">
      <div nz-row [nzGutter]="24">
        <!-- Main Form -->
        <div nz-col [nzSpan]="isEdit() ? 16 : 24">
          <nz-card [nzTitle]="'Incident Information'">
            <form nz-form [formGroup]="form" nzLayout="vertical">
              
              <!-- General Section -->
              <div nz-row [nzGutter]="16">
                <div nz-col [nzSpan]="12">
                  <nz-form-item>
                    <nz-form-label nzRequired>Incident Type</nz-form-label>
                    <nz-form-control nzErrorTip="Required">
                      <nz-select formControlName="incidentType">
                        <nz-option nzValue="INJURY" nzLabel="Injury"></nz-option>
                        <nz-option nzValue="ILLNESS" nzLabel="Illness"></nz-option>
                        <nz-option nzValue="ENVIRONMENTAL" nzLabel="Environmental"></nz-option>
                        <nz-option nzValue="PROPERTY_DAMAGE" nzLabel="Property Damage"></nz-option>
                        <nz-option nzValue="VEHICLE" nzLabel="Vehicle"></nz-option>
                        <nz-option nzValue="FIRE" nzLabel="Fire"></nz-option>
                        <nz-option nzValue="OTHER" nzLabel="Other"></nz-option>
                      </nz-select>
                    </nz-form-control>
                  </nz-form-item>
                </div>
                <div nz-col [nzSpan]="12">
                  <nz-form-item>
                    <nz-form-label nzRequired>Severity</nz-form-label>
                    <nz-form-control>
                      <nz-select formControlName="severity">
                        <nz-option nzValue="MINOR" nzLabel="Minor"></nz-option>
                        <nz-option nzValue="MODERATE" nzLabel="Moderate"></nz-option>
                        <nz-option nzValue="SERIOUS" nzLabel="Serious"></nz-option>
                        <nz-option nzValue="MAJOR" nzLabel="Major"></nz-option>
                        <nz-option nzValue="FATALITY" nzLabel="Fatality"></nz-option>
                        <nz-option nzValue="CATASTROPHIC" nzLabel="Catastrophic"></nz-option>
                      </nz-select>
                    </nz-form-control>
                  </nz-form-item>
                </div>
              </div>

              <div nz-row [nzGutter]="16">
                <div nz-col [nzSpan]="12">
                  <nz-form-item>
                    <nz-form-label nzRequired>Incident Date & Time</nz-form-label>
                    <nz-form-control nzErrorTip="Required">
                      <nz-date-picker formControlName="incidentDateTime" [nzShowTime]="true" style="width: 100%"></nz-date-picker>
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
                    <nz-form-label nzRequired>Reported By</nz-form-label>
                    <nz-form-control nzErrorTip="Required">
                      <nz-select formControlName="reportedBy" nzShowSearch nzAllowClear>
                        <nz-option *ngFor="let emp of employees()" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
                      </nz-select>
                    </nz-form-control>
                  </nz-form-item>
                </div>
                <div nz-col [nzSpan]="12">
                  <nz-form-item>
                    <nz-form-label nzRequired>Date Reported</nz-form-label>
                    <nz-form-control nzErrorTip="Required">
                      <nz-date-picker formControlName="dateReported" style="width: 100%"></nz-date-picker>
                    </nz-form-control>
                  </nz-form-item>
                </div>
              </div>

              <nz-form-item>
                <nz-form-label nzRequired>Description</nz-form-label>
                <nz-form-control nzErrorTip="Required">
                  <textarea nz-input formControlName="description" rows="3"></textarea>
                </nz-form-control>
              </nz-form-item>

              <nz-divider nzText="Injury Details" nzOrientation="left"></nz-divider>

              <div nz-row [nzGutter]="16">
                <div nz-col [nzSpan]="12">
                  <nz-form-item>
                    <nz-form-label>Injury Type</nz-form-label>
                    <nz-form-control>
                      <nz-select formControlName="injuryOccurred">
                        <nz-option nzValue="MAJOR" nzLabel="MAJOR"></nz-option>
                        <nz-option nzValue="MODERATE" nzLabel="MODERATE"></nz-option>
                        <nz-option nzValue="SERIOUS" nzLabel="SERIOUS"></nz-option>
                        <nz-option nzValue="MINOR" nzLabel="MINOR"></nz-option>
                        <nz-option nzValue="CATASTROPHIC" nzLabel="CATASTROPHIC"></nz-option>
                      </nz-select>
                    </nz-form-control>
                  </nz-form-item>
                </div>
                <div nz-col [nzSpan]="12">
                  <nz-form-item>
                    <nz-form-label>Days Lost</nz-form-label>
                    <nz-form-control>
                      <nz-input-number formControlName="daysLost" [nzMin]="0" style="width: 100%"></nz-input-number>
                    </nz-form-control>
                  </nz-form-item>
                </div>
              </div>

              <nz-form-item>
                <nz-form-label>Injury Details</nz-form-label>
                <nz-form-control>
                  <textarea nz-input formControlName="injuryDetails" rows="2"></textarea>
                </nz-form-control>
              </nz-form-item>

              <div nz-row [nzGutter]="16">
                <div nz-col [nzSpan]="24">
                  <nz-form-item>
                    <nz-form-label>Medical Treatment Required?</nz-form-label>
                    <nz-form-control>
                      <nz-switch formControlName="medicalTreatmentRequired"></nz-switch>
                    </nz-form-control>
                  </nz-form-item>
                </div>
              </div>

              <nz-form-item *ngIf="form.get('medicalTreatmentRequired')?.value">
                <nz-form-label>Medical Treatment Details</nz-form-label>
                <nz-form-control>
                  <textarea nz-input formControlName="medicalTreatmentDetails" rows="2"></textarea>
                </nz-form-control>
              </nz-form-item>

              <nz-divider nzText="Investigation & Actions" nzOrientation="left"></nz-divider>

              <nz-form-item>
                <nz-form-label>Immediate Actions Taken</nz-form-label>
                <nz-form-control>
                  <textarea nz-input formControlName="immediateActions" rows="2"></textarea>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label>Root Cause Analysis</nz-form-label>
                <nz-form-control>
                  <textarea nz-input formControlName="rootCauseAnalysis" rows="2"></textarea>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label>Investigation Findings</nz-form-label>
                <nz-form-control>
                  <textarea nz-input formControlName="investigationFindings" rows="2"></textarea>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label>Corrective Actions</nz-form-label>
                <nz-form-control>
                  <textarea nz-input formControlName="correctiveActions" rows="2"></textarea>
                </nz-form-control>
              </nz-form-item>

              <div nz-row [nzGutter]="16">
                <div nz-col [nzSpan]="12">
                  <nz-form-item>
                    <nz-form-label>Investigation Status</nz-form-label>
                    <nz-form-control>
                      <nz-select formControlName="investigationStatus">
                        <nz-option nzValue="OVERDUE" nzLabel="OVERDUE"></nz-option>
                        <nz-option nzValue="CANCELLED" nzLabel="CANCELLED"></nz-option>
                        <nz-option nzValue="PENDING_VERIFICATION" nzLabel="PENDING_VERIFICATION"></nz-option>
                        <nz-option nzValue="IN_PROGRESS" nzLabel="IN_PROGRESS"></nz-option>
                        <nz-option nzValue="OPEN" nzLabel="OPEN"></nz-option>
                        <nz-option nzValue="COMPLETED" nzLabel="COMPLETED"></nz-option>
                      </nz-select>
                    </nz-form-control>
                  </nz-form-item>
                </div>
                <div nz-col [nzSpan]="12">
                  <nz-form-item>
                    <nz-form-label>Investigation Completed Date</nz-form-label>
                    <nz-form-control>
                      <nz-date-picker formControlName="investigationCompletedDate" style="width: 100%"></nz-date-picker>
                    </nz-form-control>
                  </nz-form-item>
                </div>
              </div>

              <div class="flex justify-end gap-2 mt-4">
                <button nz-button type="button" (click)="onBack()">Cancel</button>
                
                <!-- Draft Button: Only if creating or in DRAFT/REJECTED -->
                <button *ngIf="canEdit()" nz-button nzType="default" (click)="saveDraft()" [nzLoading]="loading()">
                  Save Draft
                </button>
                
                <!-- Submit Button: Only if creating or in DRAFT -->
                <button *ngIf="canSubmit()" nz-button nzType="primary" (click)="submit()" [nzLoading]="loading()">
                  Submit
                </button>

                <!-- Approve/Reject Buttons: Only if SUBMITTED (Simulating Manager View) -->
                <button *ngIf="canApprove()" nz-button nzType="primary" nzDanger (click)="showRejectModal()">
                  Reject
                </button>
                <button *ngIf="canApprove()" nz-button nzType="primary" class="bg-green-600 border-green-600 hover:bg-green-500 hover:border-green-500" (click)="approve()">
                  Approve
                </button>
              </div>
            </form>
          </nz-card>
        </div>

        <!-- Timeline Sidebar (Only in Edit/View Mode) -->
        <div nz-col [nzSpan]="8" *ngIf="isEdit()">
          <nz-card nzTitle="Incident Timeline">
            <nz-timeline>
              <nz-timeline-item [nzColor]="'blue'" [nzDot]="draftIcon">
                <strong>Draft Created</strong>
                <p class="text-xs text-gray-500">{{ incident()?.createdAt | date:'medium' }}</p>
              </nz-timeline-item>
              
              <nz-timeline-item [nzColor]="isSubmitted() ? 'blue' : 'gray'" [nzDot]="submitIcon">
                <strong>Submitted</strong>
                <p *ngIf="isSubmitted()" class="text-xs text-gray-500">Pending Approval</p>
              </nz-timeline-item>

              <nz-timeline-item *ngIf="isApproved()" [nzColor]="'green'" [nzDot]="approveIcon">
                <strong>Approved</strong>
                <p class="text-xs text-gray-500">Investigation Authorized</p>
              </nz-timeline-item>

              <nz-timeline-item *ngIf="isRejected()" [nzColor]="'red'" [nzDot]="rejectIcon">
                <strong>Rejected</strong>
                <p class="text-xs text-gray-500">Action Required</p>
              </nz-timeline-item>
            </nz-timeline>
          </nz-card>
        </div>
      </div>
    </div>

    <!-- Icons Templates -->
    <ng-template #draftIcon><span nz-icon nzType="edit"></span></ng-template>
    <ng-template #submitIcon><span nz-icon nzType="upload"></span></ng-template>
    <ng-template #approveIcon><span nz-icon nzType="check-circle"></span></ng-template>
    <ng-template #rejectIcon><span nz-icon nzType="close-circle"></span></ng-template>

    <!-- Reject Modal -->
    <nz-modal [nzVisible]="rejectModalVisible()" (nzVisibleChange)="rejectModalVisible.set($event)" nzTitle="Reject Incident" (nzOnCancel)="rejectModalVisible.set(false)" (nzOnOk)="reject()">
      <ng-container *nzModalContent>
        <textarea nz-input placeholder="Reason for rejection..." [ngModel]="rejectReason()" (ngModelChange)="rejectReason.set($event)" rows="4"></textarea>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    :host { display: block; }
    .bg-green-600 { background-color: #52c41a; }
    .border-green-600 { border-color: #52c41a; }
  `]
})
export class SafetyIncidentFormComponent implements OnInit {
  form: FormGroup;
  
  // Signals
  loading = signal(false);
  incident = signal<SafetyIncident | null>(null);
  employees = signal<Employee[]>([]);
  isEdit = computed(() => !!this.incident());
  currentStatus = computed(() => this.incident()?.status || 'DRAFT');
  
  // Derived State
  canEdit = computed(() => !this.incident() || this.currentStatus() === 'DRAFT' || this.currentStatus() === 'REJECTED');
  canSubmit = computed(() => !this.incident() || this.currentStatus() === 'DRAFT');
  canApprove = computed(() => this.currentStatus() === 'SUBMITTED');
  
  isSubmitted = computed(() => ['SUBMITTED', 'APPROVED', 'REJECTED'].includes(this.currentStatus()));
  isApproved = computed(() => this.currentStatus() === 'APPROVED');
  isRejected = computed(() => this.currentStatus() === 'REJECTED');

  statusColor = computed(() => {
    switch (this.currentStatus()) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'SUBMITTED': return 'processing';
      default: return 'default';
    }
  });

  // Modal
  rejectModalVisible = signal(false);
  rejectReason = signal('');

  constructor(
    private fb: FormBuilder,
    private ohsService: OhsService,
    private employeesService: EmployeesService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      incidentType: ['INJURY', [Validators.required]],
      injuryOccurred: ['NONE'],
      severity: ['MINOR', [Validators.required]],
      incidentDateTime: [new Date(), [Validators.required]],
      location: ['', [Validators.required]],
      reportedBy: [null, [Validators.required]],
      dateReported: [new Date(), [Validators.required]],
      description: ['', [Validators.required]],
      injuryDetails: [''],
      medicalTreatmentRequired: [false],
      medicalTreatmentDetails: [''],
      daysLost: [0],
      immediateActions: [''],
      rootCauseAnalysis: [''],
      investigationStatus: ['OPEN'],
      investigationCompletedDate: [null],
      investigationFindings: [''],
      correctiveActions: [''],
      closed: [false],
      closedDate: [null]
    });

    // Lock form if not editable
    effect(() => {
      if (!this.canEdit()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  generateReferenceNumber(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `INC-${timestamp}-${random}`;
  }

  ngOnInit() {
    // Load Employees
    this.employeesService.getEmployees().subscribe(emps => {
      this.employees.set(emps);
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading.set(true);
      this.ohsService.getSafetyIncident(id)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (data) => {
            this.incident.set(data);
            this.form.patchValue({
              ...data,
              incidentDateTime: data.incidentDateTime ? new Date(data.incidentDateTime) : null,
              dateReported: data.dateReported ? new Date(data.dateReported) : null,
              investigationCompletedDate: data.investigationCompletedDate ? new Date(data.investigationCompletedDate) : null,
              closedDate: data.closedDate ? new Date(data.closedDate) : null,
              reportedBy: data.reportedBy?.id || data.reportedBy // Handle object or ID
            });
          },
          error: () => this.message.error('Failed to load incident')
        });
    }
  }

  submit() {
    if (!this.form.valid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const incidentId = this.incident()?.id;
    if (!incidentId) {
      this.message.warning('Save the incident as draft first before submitting.');
      return;
    }

    this.loading.set(true);
    this.ohsService.submitSafetyIncident({ incidentId, comment: 'Submitted via Portal' })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Incident submitted');
          this.refreshData();
        },
        error: () => this.message.error('Failed to submit')
      });
  }

  saveDraft() {
    this.loading.set(true);
    const val = this.form.value;
    const payload = { 
      ...val, 
      incidentDateTime: val.incidentDateTime?.toISOString(),
      dateReported: val.dateReported?.toISOString().split('T')[0],
      investigationCompletedDate: val.investigationCompletedDate?.toISOString().split('T')[0],
      closedDate: val.closedDate?.toISOString().split('T')[0],
      reportedBy: { id: val.reportedBy },
      referenceNumber: this.incident()?.referenceNumber || this.generateReferenceNumber(),
      id: this.incident()?.id
    };

    this.ohsService.draftSafetyIncident(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.message.success('Draft saved');
          if (!this.incident()) {
             this.router.navigate(['/app/health-and-safety/incidents/view', res.id], { replaceUrl: true });
          }
          this.incident.set(res);
        },
        error: () => this.message.error('Failed to save draft')
      });
  }

  approve() {
    if (!this.incident()?.id) return;
    this.loading.set(true);
    this.ohsService.approveSafetyIncident({ incidentId: this.incident()!.id, comment: 'Approved via Portal' })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Incident Approved');
          this.refreshData();
        },
        error: () => this.message.error('Failed to approve')
      });
  }

  showRejectModal() {
    this.rejectModalVisible.set(true);
  }

  reject() {
    if (!this.incident()?.id) return;
    this.loading.set(true);
    this.rejectModalVisible.set(false);
    this.ohsService.rejectSafetyIncident({ incidentId: this.incident()!.id, comment: this.rejectReason() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Incident Rejected');
          this.refreshData();
        },
        error: () => this.message.error('Failed to reject')
      });
  }

  refreshData() {
    if (this.incident()?.id) {
      this.ohsService.getSafetyIncident(this.incident()!.id).subscribe(data => {
        this.incident.set(data);
      });
    }
  }

  onBack() {
    this.router.navigate(['/app/health-and-safety/incidents']);
  }
}
