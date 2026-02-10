import { Component, OnInit, signal, computed, effect, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OhsService } from '../../services/ohs.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NearMissReport, OhsAttachment } from '../../models/ohs.model';
import { EmployeesService, Employee } from '../../../employees/services/employees.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-near-miss-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-page-header (nzBack)="onBack()" nzBackIcon [nzTitle]="isEdit() ? 'Near Miss Details' : 'Report Near Miss'">
      <nz-page-header-extra>
        <nz-tag [nzColor]="statusColor()">{{ currentStatus() }}</nz-tag>
      </nz-page-header-extra>
    </nz-page-header>
    
    <div class="p-6">
      <div nz-row [nzGutter]="24">
        <div nz-col [nzSpan]="isEdit() ? 16 : 24">
          <nz-card>
            <!-- Stepper -->
            <nz-steps [nzCurrent]="currentStep()" nzSize="small" class="mb-6">
              <nz-step nzTitle="Details"></nz-step>
              <nz-step nzTitle="Description"></nz-step>
              <nz-step nzTitle="Reporter"></nz-step>
              <nz-step nzTitle="Attachments"></nz-step>
              <nz-step nzTitle="Review"></nz-step>
            </nz-steps>

            <form nz-form [formGroup]="form" nzLayout="vertical">
              
              <!-- Step 1: Near-Miss Details -->
              <div *ngIf="currentStep() === 0">
                <div nz-row [nzGutter]="16">
                  <div nz-col [nzSpan]="12">
                    <nz-form-item>
                      <nz-form-label nzRequired>Near-Miss Date & Time</nz-form-label>
                      <nz-form-control nzErrorTip="Required">
                        <nz-date-picker formControlName="incidentDateTime" [nzShowTime]="true" style="width: 100%"></nz-date-picker>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  <div nz-col [nzSpan]="12">
                    <nz-form-item>
                      <nz-form-label nzRequired>Location</nz-form-label>
                      <nz-form-control nzErrorTip="Required">
                        <input nz-input formControlName="location" placeholder="Where did this happen?" />
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                </div>

                <div nz-row [nzGutter]="16">
                  <div nz-col [nzSpan]="12">
                    <nz-form-item>
                      <nz-form-label nzRequired>Potential Severity</nz-form-label>
                      <nz-form-control nzErrorTip="Required">
                        <nz-select formControlName="potentialSeverity" nzPlaceHolder="Select potential severity">
                          <nz-option nzValue="MINOR" nzLabel="Minor"></nz-option>
                          <nz-option nzValue="MODERATE" nzLabel="Moderate"></nz-option>
                          <nz-option nzValue="SERIOUS" nzLabel="Serious"></nz-option>
                          <nz-option nzValue="MAJOR" nzLabel="Major"></nz-option>
                          <nz-option nzValue="CATASTROPHIC" nzLabel="Catastrophic"></nz-option>
                          <nz-option nzValue="FATALITY" nzLabel="Fatality"></nz-option>
                        </nz-select>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  <div nz-col [nzSpan]="12">
                    <nz-form-item>
                      <nz-form-label>Date Reported</nz-form-label>
                      <nz-form-control>
                        <nz-date-picker formControlName="dateReported" [nzDisabled]="true" style="width: 100%"></nz-date-picker>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                </div>
              </div>

              <!-- Step 2: Description & Potential Risk -->
              <div *ngIf="currentStep() === 1">
                <nz-form-item>
                  <nz-form-label nzRequired>Near-Miss Description</nz-form-label>
                  <nz-form-control nzErrorTip="Required">
                    <textarea nz-input formControlName="description" rows="4" placeholder="Clearly state what almost happened..."></textarea>
                  </nz-form-control>
                </nz-form-item>

                <nz-form-item>
                  <nz-form-label>Potential Consequences</nz-form-label>
                  <nz-form-control>
                    <textarea nz-input formControlName="potentialConsequences" rows="4" placeholder="Describe what could have occurred if the near-miss escalated..."></textarea>
                  </nz-form-control>
                </nz-form-item>
              </div>

              <!-- Step 3: Reporter Information -->
              <div *ngIf="currentStep() === 2">
                <nz-form-item>
                  <nz-form-label>Anonymous Reporting</nz-form-label>
                  <nz-form-control>
                    <nz-switch formControlName="anonymous"></nz-switch>
                    <span class="ml-2 text-gray-500">Hide my identity in the report</span>
                  </nz-form-control>
                </nz-form-item>

                <nz-form-item *ngIf="!form.get('anonymous')?.value">
                  <nz-form-label nzRequired>Reported By</nz-form-label>
                  <nz-form-control nzErrorTip="Required">
                    <nz-select formControlName="reportedBy" nzShowSearch nzAllowClear nzPlaceHolder="Select employee">
                      <nz-option *ngFor="let emp of employees()" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
                    </nz-select>
                  </nz-form-control>
                </nz-form-item>

                <nz-alert nzType="info" nzMessage="Reporting a near-miss helps us prevent future accidents. Thank you for your contribution to safety." nzShowIcon></nz-alert>
              </div>

              <!-- Step 4: Attachments -->
              <div *ngIf="currentStep() === 3">
                <div class="upload-container text-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mb-4">
                  <p class="mb-2 text-gray-500">Upload images or documents related to the near-miss.</p>
                  <button nz-button (click)="mockUpload()">
                    <span nz-icon nzType="upload"></span> Upload File
                  </button>
                </div>

                <nz-list [nzDataSource]="attachments()" nzBordered [nzRenderItem]="item">
                  <ng-template #item let-item>
                    <nz-list-item [nzActions]="[removeAction]">
                      <nz-list-item-meta
                        [nzTitle]="item.fileName"
                        [nzDescription]="item.fileType">
                      </nz-list-item-meta>
                      <ng-template #removeAction>
                        <a (click)="removeAttachment(item.id)" class="text-red-500">Remove</a>
                      </ng-template>
                    </nz-list-item>
                  </ng-template>
                </nz-list>
              </div>

              <!-- Step 5: Review & Submit -->
              <div *ngIf="currentStep() === 4">
                <nz-alert nzType="warning" nzMessage="No Injury or Damage Occurred" nzDescription="This report is for prevention and risk awareness only. If an injury occurred, please file a Safety Incident instead." nzShowIcon class="mb-4"></nz-alert>
                
                <nz-descriptions nzTitle="Review Report" nzBordered [nzColumn]="1">
                  <nz-descriptions-item nzTitle="Date & Time">{{ form.get('incidentDateTime')?.value | date:'medium' }}</nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Location">{{ form.get('location')?.value }}</nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Severity"><nz-tag [nzColor]="'orange'">{{ form.get('potentialSeverity')?.value }}</nz-tag></nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Description">{{ form.get('description')?.value }}</nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Potential Consequences">{{ form.get('potentialConsequences')?.value || 'N/A' }}</nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Reporter">
                    {{ form.get('anonymous')?.value ? 'Anonymous' : getReporterName(form.get('reportedBy')?.value) }}
                  </nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Attachments">{{ attachments().length }} file(s)</nz-descriptions-item>
                </nz-descriptions>
              </div>

              <!-- Navigation Buttons -->
              <div class="steps-action mt-6 flex justify-between">
                <div>
                  <button nz-button nzType="default" (click)="pre()" *ngIf="currentStep() > 0">
                    Previous
                  </button>
                </div>
                <div class="flex gap-2">
                  <button nz-button nzType="default" (click)="onBack()">Cancel</button>
                  
                  <button nz-button nzType="default" (click)="saveDraft()" [nzLoading]="loading()" *ngIf="canEdit()">
                    Save Draft
                  </button>

                  <button nz-button nzType="primary" (click)="next()" *ngIf="currentStep() < 4">
                    Next
                  </button>
                  
                  <button nz-button nzType="primary" (click)="submit()" [nzLoading]="loading()" *ngIf="currentStep() === 4 && canSubmit()">
                    Submit Report
                  </button>

                  <!-- Approval Workflow Buttons (Visible on any step if in review mode) -->
                  <button *ngIf="canApprove()" nz-button nzType="primary" nzDanger (click)="showRejectModal()">Reject</button>
                  <button *ngIf="canApprove()" nz-button nzType="primary" class="bg-green-600 border-green-600 hover:bg-green-500 hover:border-green-500" (click)="approve()">Approve</button>
                </div>
              </div>

            </form>
          </nz-card>
        </div>

        <!-- Timeline (Only in Edit/View Mode) -->
        <div nz-col [nzSpan]="8" *ngIf="isEdit()">
          <nz-card nzTitle="Report Timeline">
            <nz-timeline>
              <nz-timeline-item [nzColor]="'blue'" [nzDot]="draftIcon">
                <strong>Draft Created</strong>
                <p class="text-xs text-gray-500">{{ report()?.createdAt | date:'medium' }}</p>
              </nz-timeline-item>
              
              <nz-timeline-item [nzColor]="isSubmitted() ? 'blue' : 'gray'" [nzDot]="submitIcon">
                <strong>Submitted</strong>
                <p *ngIf="isSubmitted()" class="text-xs text-gray-500">Pending Review</p>
              </nz-timeline-item>

              <nz-timeline-item *ngIf="isApproved()" [nzColor]="'green'" [nzDot]="approveIcon">
                <strong>Approved</strong>
                <p class="text-xs text-gray-500">Action Plan Verified</p>
              </nz-timeline-item>

              <nz-timeline-item *ngIf="isRejected()" [nzColor]="'red'" [nzDot]="rejectIcon">
                <strong>Rejected</strong>
                <p class="text-xs text-gray-500">More Info Required</p>
              </nz-timeline-item>
            </nz-timeline>
          </nz-card>
        </div>
      </div>
    </div>

    <ng-template #draftIcon><span nz-icon nzType="edit"></span></ng-template>
    <ng-template #submitIcon><span nz-icon nzType="upload"></span></ng-template>
    <ng-template #approveIcon><span nz-icon nzType="check-circle"></span></ng-template>
    <ng-template #rejectIcon><span nz-icon nzType="close-circle"></span></ng-template>

    <nz-modal [(nzVisible)]="rejectModalVisible" nzTitle="Reject Report" (nzOnCancel)="rejectModalVisible = false" (nzOnOk)="reject()">
      <ng-container *nzModalContent>
        <textarea nz-input placeholder="Reason for rejection..." [(ngModel)]="rejectReason" rows="4"></textarea>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    :host { display: block; }
    .bg-green-600 { background-color: #52c41a; }
    .border-green-600 { border-color: #52c41a; }
    .steps-content { margin-top: 16px; border: 1px dashed #e9e9e9; border-radius: 6px; background-color: #fafafa; min-height: 200px; text-align: center; padding-top: 80px; }
    .steps-action { margin-top: 24px; }
  `]
})
export class NearMissFormComponent implements OnInit {
  form: FormGroup;
  currentStep = signal(0);
  
  loading = signal(false);
  report = signal<NearMissReport | null>(null);
  employees = signal<Employee[]>([]);
  attachments = signal<OhsAttachment[]>([]);
  
  isEdit = computed(() => !!this.report());
  currentStatus = computed(() => this.report()?.status || 'DRAFT');
  
  canEdit = computed(() => !this.report() || this.currentStatus() === 'DRAFT' || this.currentStatus() === 'REJECTED');
  canSubmit = computed(() => !this.report() || this.currentStatus() === 'DRAFT');
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

  rejectModalVisible = false;
  rejectReason = '';

  constructor(
    private fb: FormBuilder,
    private ohsService: OhsService,
    private employeesService: EmployeesService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      incidentDateTime: [new Date(), [Validators.required]],
      location: ['', [Validators.required]],
      potentialSeverity: ['MINOR', [Validators.required]],
      dateReported: [{ value: new Date(), disabled: true }],
      description: ['', [Validators.required]],
      potentialConsequences: [''],
      reportedBy: [null], // Validator added dynamically
      anonymous: [false]
    });

    // Dynamic validator for reportedBy based on anonymous toggle
    this.form.get('anonymous')?.valueChanges.subscribe(isAnonymous => {
      const reportedByControl = this.form.get('reportedBy');
      if (isAnonymous) {
        reportedByControl?.clearValidators();
        reportedByControl?.setValue(null);
      } else {
        reportedByControl?.setValidators([Validators.required]);
      }
      reportedByControl?.updateValueAndValidity();
    });

    effect(() => {
      if (!this.canEdit()) {
        this.form.disable();
      } else {
        this.form.enable();
        // Keep dateReported disabled even in edit mode
        this.form.get('dateReported')?.disable();
      }
    });
  }

  ngOnInit() {
    // Load Employees
    this.employeesService.getEmployees().subscribe(emps => {
      this.employees.set(emps);
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading.set(true);
      this.ohsService.getNearMissReport(id)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (data) => {
            this.report.set(data);
            this.attachments.set(data.attachments || []);
            this.form.patchValue({
              ...data,
              incidentDateTime: data.incidentDateTime ? new Date(data.incidentDateTime) : null,
              dateReported: data.dateReported ? new Date(data.dateReported) : new Date(),
              reportedBy: data.reportedBy?.id || data.reportedBy
            });
            this.cdr.markForCheck();
          },
          error: () => this.message.error('Failed to load report')
        });
    }
  }

  pre(): void {
    this.currentStep.update(i => i - 1);
  }

  next(): void {
    if (this.validateCurrentStep()) {
      this.currentStep.update(i => i + 1);
    }
  }

  validateCurrentStep(): boolean {
    const step = this.currentStep();
    let controls: string[] = [];

    if (step === 0) controls = ['incidentDateTime', 'location', 'potentialSeverity'];
    if (step === 1) controls = ['description'];
    if (step === 2) controls = this.form.get('anonymous')?.value ? [] : ['reportedBy'];

    let valid = true;
    controls.forEach(name => {
      const control = this.form.get(name);
      if (control && control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
        valid = false;
      }
    });

    return valid;
  }

  getReporterName(id: any): string {
    const emp = this.employees().find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  }

  // --- Attachments (Mock) ---
  mockUpload() {
    const newFile: OhsAttachment = {
      id: Math.random().toString(36).substring(7),
      fileName: `evidence-${Date.now()}.jpg`,
      fileType: 'image/jpeg',
      fileUrl: '#'
    };
    this.attachments.update(files => [...files, newFile]);
    this.message.success('File uploaded successfully');
  }

  removeAttachment(id: string) {
    this.attachments.update(files => files.filter(f => f.id !== id));
  }

  // --- Submission ---

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      const val = this.form.value;
      const payload = { 
        ...val, 
        incidentDateTime: val.incidentDateTime?.toISOString(),
        dateReported: val.dateReported?.toISOString().split('T')[0], // LocalDate
        reportedBy: val.anonymous ? null : { id: val.reportedBy },
        attachments: this.attachments(),
        id: this.report()?.id
      };
      
      const request = this.report()
        ? this.ohsService.submitNearMissReport(payload)
        : this.ohsService.submitNearMissReport(payload);

      request.pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (res) => {
            this.message.success('Report submitted successfully');
            this.report.set(res);
            this.cdr.markForCheck();
          },
          error: () => this.message.error('Failed to submit report')
        });
    } else {
      this.message.error('Please complete all required fields');
    }
  }

  saveDraft() {
    this.loading.set(true);
    const val = this.form.value;
    const payload = { 
      ...val, 
      incidentDateTime: val.incidentDateTime?.toISOString(),
      dateReported: val.dateReported?.toISOString().split('T')[0],
      reportedBy: val.anonymous ? null : { id: val.reportedBy },
      referenceNumber: this.generateReferenceNumber(),
      attachments: this.attachments(),
      id: this.report()?.id
    };

    this.ohsService.draftNearMissReport(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.message.success('Draft saved');
          if (!this.report()) {
             this.router.navigate(['/app/health-and-safety/near-misses/view', res.id], { replaceUrl: true });
          }
          this.report.set(res);
          this.cdr.markForCheck();
        },
        error: () => this.message.error('Failed to save draft')
      });
  }

  generateReferenceNumber(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `NMS-${timestamp}-${random}`;
  }

  approve() {
    if (!this.report()?.id) return;
    this.loading.set(true);
    this.ohsService.approveNearMissReport({ incidentId: this.report()!.id, comment: 'Approved' })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Report Approved');
          this.refreshData();
        },
        error: () => this.message.error('Failed to approve')
      });
  }

  showRejectModal() {
    this.rejectModalVisible = true;
  }

  reject() {
    if (!this.report()?.id) return;
    this.loading.set(true);
    this.rejectModalVisible = false;
    this.ohsService.rejectNearMissReport({ incidentId: this.report()!.id, comment: this.rejectReason })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Report Rejected');
          this.refreshData();
        },
        error: () => this.message.error('Failed to reject')
      });
  }

  refreshData() {
    if (this.report()?.id) {
      this.ohsService.getNearMissReport(this.report()!.id).subscribe(data => {
        this.report.set(data);
        this.cdr.markForCheck();
      });
    }
  }

  onBack() {
    this.router.navigate(['/app/health-and-safety/near-misses']);
  }
}
