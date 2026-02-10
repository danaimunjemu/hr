import { Component, OnInit, signal, computed, effect, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OhsService } from '../../services/ohs.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MedicalSurveillance } from '../../models/ohs.model';
import { EmployeesService, Employee } from '../../../employees/services/employees.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-medical-surveillance-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-page-header (nzBack)="onBack()" nzBackIcon [nzTitle]="isEdit() ? 'Medical Record Details' : 'New Medical Record'">
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
              <nz-step nzTitle="Assessment"></nz-step>
              <nz-step nzTitle="Fitness"></nz-step>
              <nz-step nzTitle="Reporting"></nz-step>
              <nz-step nzTitle="Review"></nz-step>
            </nz-steps>

            <form nz-form [formGroup]="form" nzLayout="vertical">
              
              <!-- Step 1: Employee & Examination Details -->
              <div *ngIf="currentStep() === 0">
                <div nz-row [nzGutter]="16">
                  <div nz-col [nzSpan]="12">
                    <nz-form-item>
                      <nz-form-label nzRequired>Employee</nz-form-label>
                      <nz-form-control nzErrorTip="Required">
                        <nz-select formControlName="employee" nzShowSearch nzAllowClear nzPlaceHolder="Select employee">
                          <nz-option *ngFor="let emp of employees()" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
                        </nz-select>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  <div nz-col [nzSpan]="12">
                    <nz-form-item>
                      <nz-form-label nzRequired>Examination Type</nz-form-label>
                      <nz-form-control nzErrorTip="Required">
                        <nz-select formControlName="examinationType" nzPlaceHolder="Select type">
                          <nz-option nzValue="Pre-employment" nzLabel="Pre-employment"></nz-option>
                          <nz-option nzValue="Periodic" nzLabel="Periodic"></nz-option>
                          <nz-option nzValue="Exit" nzLabel="Exit"></nz-option>
                          <nz-option nzValue="Fitness-for-Duty" nzLabel="Fitness-for-Duty"></nz-option>
                          <nz-option nzValue="Return to Work" nzLabel="Return to Work"></nz-option>
                        </nz-select>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                </div>

                <div nz-row [nzGutter]="16">
                  <div nz-col [nzSpan]="12">
                    <nz-form-item>
                      <nz-form-label nzRequired>Examination Date</nz-form-label>
                      <nz-form-control nzErrorTip="Required">
                        <nz-date-picker formControlName="examinationDate" style="width: 100%"></nz-date-picker>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  <div nz-col [nzSpan]="12">
                    <nz-form-item>
                      <nz-form-label>Next Examination Due</nz-form-label>
                      <nz-form-control>
                        <nz-date-picker formControlName="nextExaminationDue" style="width: 100%"></nz-date-picker>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                </div>

                <div nz-row [nzGutter]="16">
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

              <!-- Step 2: Medical Assessment -->
              <div *ngIf="currentStep() === 1">
                <div nz-row [nzGutter]="16">
                  <div nz-col [nzSpan]="12">
                    <nz-form-item>
                      <nz-form-label>Medical Provider</nz-form-label>
                      <nz-form-control>
                        <input nz-input formControlName="medicalProvider" placeholder="e.g. City Health Clinic" />
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  <div nz-col [nzSpan]="12">
                    <nz-form-item>
                      <nz-form-label>Examining Doctor</nz-form-label>
                      <nz-form-control>
                        <input nz-input formControlName="examiningDoctor" placeholder="e.g. Dr. Smith" />
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                </div>
              </div>

              <!-- Step 3: Fitness & Restrictions -->
              <div *ngIf="currentStep() === 2">
                <nz-form-item>
                  <nz-form-label nzRequired>Fitness Status</nz-form-label>
                  <nz-form-control>
                    <nz-radio-group formControlName="fitnessStatus">
                      <label nz-radio [nzValue]="true" class="text-green-600 font-medium">Fit for Duty</label>
                      <label nz-radio [nzValue]="false" class="text-red-600 font-medium">Not Fit for Duty</label>
                    </nz-radio-group>
                  </nz-form-control>
                </nz-form-item>

                <div *ngIf="form.get('fitnessStatus')?.value === false">
                  <nz-form-item>
                    <nz-form-label nzRequired>Restrictions</nz-form-label>
                    <nz-form-control nzErrorTip="Required when not fit">
                      <textarea nz-input formControlName="restrictions" rows="4" placeholder="Describe work restrictions..."></textarea>
                    </nz-form-control>
                  </nz-form-item>

                  <nz-form-item>
                    <nz-form-label>Restriction End Date</nz-form-label>
                    <nz-form-control>
                      <nz-date-picker formControlName="restrictionEndDate" style="width: 100%"></nz-date-picker>
                    </nz-form-control>
                  </nz-form-item>
                </div>
              </div>

              <!-- Step 4: Reporting & Recommendations -->
              <div *ngIf="currentStep() === 3">
                <nz-form-item>
                  <nz-form-label nzRequired>Reported By</nz-form-label>
                  <nz-form-control nzErrorTip="Required">
                    <nz-select formControlName="reportedBy" nzShowSearch nzAllowClear nzPlaceHolder="Select employee">
                      <nz-option *ngFor="let emp of employees()" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
                    </nz-select>
                  </nz-form-control>
                </nz-form-item>

                <nz-form-item>
                  <nz-form-label>Recommendations</nz-form-label>
                  <nz-form-control>
                    <textarea nz-input formControlName="recommendations" rows="4" placeholder="Medical or workplace recommendations..."></textarea>
                  </nz-form-control>
                </nz-form-item>
              </div>

              <!-- Step 5: Review & Submit -->
              <div *ngIf="currentStep() === 4">
                <nz-alert nzType="info" nzMessage="Compliance Record" nzDescription="This record supports employee health monitoring and legal OHS compliance." nzShowIcon class="mb-4"></nz-alert>
                
                <nz-descriptions nzTitle="Review Record" nzBordered [nzColumn]="1">
                  <nz-descriptions-item nzTitle="Employee">{{ getEmployeeName(form.get('employee')?.value) }}</nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Type">{{ form.get('examinationType')?.value }}</nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Date">{{ form.get('examinationDate')?.value | date:'mediumDate' }}</nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Provider">{{ form.get('medicalProvider')?.value || 'N/A' }} ({{ form.get('examiningDoctor')?.value || 'N/A' }})</nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Fitness Status">
                    <nz-tag [nzColor]="form.get('fitnessStatus')?.value ? 'green' : 'red'">
                      {{ form.get('fitnessStatus')?.value ? 'Fit for Duty' : 'Not Fit' }}
                    </nz-tag>
                  </nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Restrictions" *ngIf="!form.get('fitnessStatus')?.value">
                    {{ form.get('restrictions')?.value }} (Until: {{ form.get('restrictionEndDate')?.value | date:'mediumDate' }})
                  </nz-descriptions-item>
                  <nz-descriptions-item nzTitle="Reported By">{{ getEmployeeName(form.get('reportedBy')?.value) }}</nz-descriptions-item>
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
                    Submit Record
                  </button>

                  <!-- Approval Workflow Buttons -->
                  <button *ngIf="canApprove()" nz-button nzType="primary" nzDanger (click)="showRejectModal()">Reject</button>
                  <button *ngIf="canApprove()" nz-button nzType="primary" class="bg-green-600 border-green-600 hover:bg-green-500 hover:border-green-500" (click)="approve()">Approve</button>
                </div>
              </div>

            </form>
          </nz-card>
        </div>

        <!-- Timeline (Only in Edit/View Mode) -->
        <div nz-col [nzSpan]="8" *ngIf="isEdit()">
          <nz-card nzTitle="Record Timeline">
            <nz-timeline>
              <nz-timeline-item [nzColor]="'blue'" [nzDot]="draftIcon">
                <strong>Draft Created</strong>
                <p class="text-xs text-gray-500">{{ record()?.createdAt | date:'medium' }}</p>
              </nz-timeline-item>
              
              <nz-timeline-item [nzColor]="isSubmitted() ? 'blue' : 'gray'" [nzDot]="submitIcon">
                <strong>Submitted</strong>
                <p *ngIf="isSubmitted()" class="text-xs text-gray-500">Pending Review</p>
              </nz-timeline-item>

              <nz-timeline-item *ngIf="isApproved()" [nzColor]="'green'" [nzDot]="approveIcon">
                <strong>Approved</strong>
                <p class="text-xs text-gray-500">Compliance Verified</p>
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

    <nz-modal [(nzVisible)]="rejectModalVisible" nzTitle="Reject Record" (nzOnCancel)="rejectModalVisible = false" (nzOnOk)="reject()">
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
export class MedicalSurveillanceFormComponent implements OnInit {
  form: FormGroup;
  currentStep = signal(0);
  
  loading = signal(false);
  record = signal<MedicalSurveillance | null>(null);
  employees = signal<Employee[]>([]);
  
  isEdit = computed(() => !!this.record());
  currentStatus = computed(() => this.record()?.status || 'DRAFT');
  
  canEdit = computed(() => !this.record() || this.currentStatus() === 'DRAFT' || this.currentStatus() === 'REJECTED');
  canSubmit = computed(() => !this.record() || this.currentStatus() === 'DRAFT');
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
      employee: [null, [Validators.required]],
      examinationType: [null, [Validators.required]],
      examinationDate: [new Date(), [Validators.required]],
      nextExaminationDue: [null],
      dateReported: [{ value: new Date(), disabled: true }],
      medicalProvider: [''],
      examiningDoctor: [''],
      fitnessStatus: [true, [Validators.required]],
      restrictions: [''],
      restrictionEndDate: [null],
      reportedBy: [null, [Validators.required]],
      recommendations: ['']
    });

    // Dynamic validation for restrictions based on fitness status
    this.form.get('fitnessStatus')?.valueChanges.subscribe(isFit => {
      const restrictionsControl = this.form.get('restrictions');
      const endDateControl = this.form.get('restrictionEndDate');
      
      if (!isFit) {
        restrictionsControl?.setValidators([Validators.required]);
        endDateControl?.enable();
      } else {
        restrictionsControl?.clearValidators();
        endDateControl?.disable();
        endDateControl?.setValue(null);
        restrictionsControl?.setValue('');
      }
      restrictionsControl?.updateValueAndValidity();
    });

    effect(() => {
      if (!this.canEdit()) {
        this.form.disable();
      } else {
        this.form.enable();
        this.form.get('dateReported')?.disable();
        // Re-apply logic for restriction end date enablement
        if (this.form.get('fitnessStatus')?.value) {
          this.form.get('restrictionEndDate')?.disable();
        }
      }
    });
  }

  ngOnInit() {
    this.employeesService.getEmployees().subscribe(emps => {
      this.employees.set(emps);
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading.set(true);
      this.ohsService.getMedicalSurveillance(id)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (data) => {
            this.record.set(data);
            this.form.patchValue({
              ...data,
              employee: data.employee?.id || data.employee,
              reportedBy: data.reportedBy?.id || data.reportedBy,
              examinationDate: data.examinationDate ? new Date(data.examinationDate) : null,
              nextExaminationDue: data.nextExaminationDue ? new Date(data.nextExaminationDue) : null,
              restrictionEndDate: data.restrictionEndDate ? new Date(data.restrictionEndDate) : null,
              dateReported: data.dateReported ? new Date(data.dateReported) : new Date()
            });
            this.cdr.markForCheck();
          },
          error: () => this.message.error('Failed to load record')
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

    if (step === 0) controls = ['employee', 'examinationType', 'examinationDate'];
    if (step === 1) controls = []; // Optional fields
    if (step === 2) controls = ['fitnessStatus', 'restrictions'];
    if (step === 3) controls = ['reportedBy'];

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

  getEmployeeName(id: any): string {
    const emp = this.employees().find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  }

  generateReferenceNumber(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `MSV-${timestamp}-${random}`;
  }

  // --- Submission ---

  submit() {
    if (this.form.valid) {
      this.loading.set(true);
      const val = this.form.value;
      const payload = { 
        ...val, 
        examinationDate: val.examinationDate?.toISOString().split('T')[0],
        nextExaminationDue: val.nextExaminationDue?.toISOString().split('T')[0],
        restrictionEndDate: val.restrictionEndDate?.toISOString().split('T')[0],
        dateReported: val.dateReported?.toISOString().split('T')[0],
        employee: { id: val.employee },
        reportedBy: { id: val.reportedBy },
        id: this.record()?.id
      };
      
      const request = this.record()
        ? this.ohsService.submitMedicalSurveillance(payload)
        : this.ohsService.submitMedicalSurveillance(payload);

      request.pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (res) => {
            this.message.success('Record submitted successfully');
            this.record.set(res);
            this.cdr.markForCheck();
          },
          error: () => this.message.error('Failed to submit record')
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
      examinationDate: val.examinationDate?.toISOString().split('T')[0],
      nextExaminationDue: val.nextExaminationDue?.toISOString().split('T')[0],
      restrictionEndDate: val.restrictionEndDate?.toISOString().split('T')[0],
      dateReported: val.dateReported?.toISOString().split('T')[0],
      employee: { id: val.employee },
      reportedBy: { id: val.reportedBy },
      referenceNumber: this.generateReferenceNumber(),
      id: this.record()?.id
    };

    this.ohsService.draftMedicalSurveillance(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.message.success('Draft saved');
          if (!this.record()) {
             this.router.navigate(['/app/health-and-safety/medical/view', res.id], { replaceUrl: true });
          }
          this.record.set(res);
          this.cdr.markForCheck();
        },
        error: () => this.message.error('Failed to save draft')
      });
  }

  approve() {
    if (!this.record()?.id) return;
    this.loading.set(true);
    this.ohsService.approveMedicalSurveillance({ incidentId: this.record()!.id, comment: 'Approved' })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Record Approved');
          this.refreshData();
        },
        error: () => this.message.error('Failed to approve')
      });
  }

  showRejectModal() {
    this.rejectModalVisible = true;
  }

  reject() {
    if (!this.record()?.id) return;
    this.loading.set(true);
    this.rejectModalVisible = false;
    this.ohsService.rejectMedicalSurveillance({ incidentId: this.record()!.id, comment: this.rejectReason })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Record Rejected');
          this.refreshData();
        },
        error: () => this.message.error('Failed to reject')
      });
  }

  refreshData() {
    if (this.record()?.id) {
      this.ohsService.getMedicalSurveillance(this.record()!.id).subscribe(data => {
        this.record.set(data);
        this.cdr.markForCheck();
      });
    }
  }

  onBack() {
    this.router.navigate(['/app/health-and-safety/medical']);
  }
}
