import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErCaseService } from '../../services/er-case.service';
import { ErCase } from '../../models/er-case.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ErProcessService } from '../../../process/services/er-process.service';
import { EmployeesService, Employee } from '../../../../employees/services/employees.service';

@Component({
  selector: 'app-case-view',
  standalone: false,
  template: `
    <div class="page-header">
      <nz-page-header (nzBack)="onBack()" nzBackIcon nzTitle="Case Details" [nzSubtitle]="case()?.caseNumber">
        <nz-page-header-extra>
          <button nz-button nzType="primary" [routerLink]="['../../edit', case()?.id]">Edit</button>
        </nz-page-header-extra>
      </nz-page-header>
    </div>

    <nz-spin [nzSpinning]="loading()">
      <div *ngIf="case() as case">
        <nz-card nzTitle="General Information" class="mb-4">
          <nz-descriptions [nzColumn]="2" nzBordered>
            <nz-descriptions-item nzTitle="Title">{{ case.title }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Case Type">{{ case.caseType }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Status"><nz-tag>{{ case.status }}</nz-tag></nz-descriptions-item>
            <nz-descriptions-item nzTitle="Priority"><nz-tag>{{ case.priority }}</nz-tag></nz-descriptions-item>
            <nz-descriptions-item nzTitle="Confidentiality">{{ case.confidentiality }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Current Stage">{{ case.currentStageCode }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Created On">{{ case.createdOn | date:'medium' }}</nz-descriptions-item>
          </nz-descriptions>
        </nz-card>

        <nz-card nzTitle="People Involved" class="mb-4">
          <nz-descriptions [nzColumn]="2" nzBordered>
            <nz-descriptions-item nzTitle="Subject Employee">
              {{ case.subjectEmployee.firstName }} {{ case.subjectEmployee.lastName }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Reporter">
              {{ case.reporterEmployee.firstName }} {{ case.reporterEmployee.lastName }} ({{ case.reporterType }})
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Assigned To">
              <div *ngIf="case.assignedToUser; else unassigned">
                {{ case.assignedToUser.firstName }} {{ case.assignedToUser.lastName }}
              </div>
              <ng-template #unassigned>
                <div class="flex items-center gap-2">
                  <span class="text-gray-400 italic">Not Assigned</span>
                  <button nz-button nzType="link" nzSize="small" (click)="openAssignModal()">Assign Case</button>
                </div>
              </ng-template>
            </nz-descriptions-item>
          </nz-descriptions>
        </nz-card>

        <nz-card nzTitle="Summary">
          <p>{{ case.summary }}</p>
        </nz-card>

        <nz-tabs class="mt-4">
          <nz-tab nzTitle="Intake">
            <ng-template nz-tab>
              <div class="mb-3 flex gap-2">
                <button nz-button nzType="primary" (click)="openIntakeModal()">Add Intake</button>
                <button *ngIf="case.intake" nz-button (click)="openDocLinkModal('INTAKE')">Link Document</button>
              </div>
              <nz-card nzTitle="Intake" class="mb-4">
                <div *ngIf="case.intake; else noIntake">
                  <nz-descriptions [nzColumn]="2" nzBordered>
                    <nz-descriptions-item nzTitle="Incident Date From">{{ case.intake.incidentDateFrom | date:'medium' }}</nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Incident Date To">{{ (case.intake.incidentDateTo | date:'medium') || 'N/A' }}</nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Location">{{ case.intake.incidentLocation }}</nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Triage Decision">{{ case.intake.triageDecision || 'PENDING' }}</nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Triage Notes">{{ case.intake.triageNotes || 'N/A' }}</nz-descriptions-item>
                  </nz-descriptions>
                  <div class="mt-3">
                    <h4 class="font-bold mb-2">Description</h4>
                    <p class="whitespace-pre-wrap">{{ case.intake.detailedDescription }}</p>
                  </div>
                </div>
                <ng-template #noIntake>
                  <p class="text-gray-500">No intake recorded.</p>
                </ng-template>
              </nz-card>
            </ng-template>
          </nz-tab>

          <nz-tab nzTitle="Outcome">
            <ng-template nz-tab>
              <div class="mb-3 flex gap-2">
                <button nz-button nzType="primary" (click)="openOutcomeModal()">Add Outcome</button>
                <button *ngIf="case.outcome" nz-button (click)="openDocLinkModal('OUTCOME')">Link Document</button>
              </div>
              <nz-card nzTitle="Outcome" class="mb-4">
                <div *ngIf="case.outcome; else noOutcome">
                  <nz-descriptions [nzColumn]="2" nzBordered>
                    <nz-descriptions-item nzTitle="Outcome Type">{{ case.outcome.outcomeType }}</nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Decision Date">{{ case.outcome.decisionAt | date:'medium' }}</nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Decided By">
                      {{ case.outcome.decidedBy?.firstName }} {{ case.outcome.decidedBy?.lastName }}
                    </nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Communicated At">
                      {{ (case.outcome.communicatedAt | date:'medium') || 'Not communicated' }}
                    </nz-descriptions-item>
                  </nz-descriptions>
                  <div class="mt-3">
                    <h4 class="font-bold mb-2">Decision Summary</h4>
                    <p class="whitespace-pre-wrap">{{ case.outcome.decisionSummary }}</p>
                  </div>
                  <div class="mt-3">
                    <h4 class="font-bold mb-2">Action Taken</h4>
                    <p class="whitespace-pre-wrap">{{ case.outcome.actionTaken }}</p>
                  </div>
                </div>
                <ng-template #noOutcome>
                  <p class="text-gray-500">No outcome recorded.</p>
                </ng-template>
              </nz-card>
            </ng-template>
          </nz-tab>

          <nz-tab nzTitle="Tasks">
            <ng-template nz-tab>
              <div class="mb-3">
                <button nz-button nzType="primary" (click)="openTaskModal()">Add Task</button>
              </div>
              <nz-card nzTitle="Tasks">
                <nz-table #taskTable [nzData]="case.tasks || []">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Due Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let task of taskTable.data">
                      <td>{{ task.title }}</td>
                      <td>{{ task.taskType }}</td>
                      <td><nz-tag>{{ task.status }}</nz-tag></td>
                      <td>{{ task.assignedTo?.firstName }} {{ task.assignedTo?.lastName }}</td>
                      <td>{{ task.dueAt | date:'medium' }}</td>
                      <td>
                        <a [routerLink]="['/app/employee-relations/tasks/view', task.id]">View</a>
                      </td>
                    </tr>
                  </tbody>
                </nz-table>
              </nz-card>
            </ng-template>
          </nz-tab>
        </nz-tabs>
      </div>
    </nz-spin>

    <nz-modal
      [nzVisible]="intakeModalOpen()"
      nzTitle="Add Intake"
      [nzFooter]="null"
      (nzOnCancel)="closeIntakeModal()"
    >
    <ng-container *nzModalContent>
      <form nz-form [formGroup]="intakeForm" nzLayout="vertical">
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Incident Date (From)</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-date-picker formControlName="incidentDateFrom" nzShowTime style="width: 100%"></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label>Incident Date (To)</nz-form-label>
              <nz-form-control>
                <nz-date-picker formControlName="incidentDateTo" nzShowTime style="width: 100%"></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Incident Location</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <input nz-input formControlName="incidentLocation" placeholder="e.g. Johannesburg Office" />
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Triage Decision</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-select formControlName="triageDecision">
                  <nz-option nzValue="PROCEED_TO_INVESTIGATION" nzLabel="Proceed to Investigation"></nz-option>
                  <nz-option nzValue="NO_ACTION" nzLabel="No Action Required"></nz-option>
                  <nz-option nzValue="INFORMAL_RESOLUTION" nzLabel="Informal Resolution"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
        <nz-form-item>
          <nz-form-label>Triage Notes</nz-form-label>
          <nz-form-control>
            <textarea nz-input formControlName="triageNotes" rows="2"></textarea>
          </nz-form-control>
        </nz-form-item>
        <nz-form-item>
          <nz-form-label nzRequired>Detailed Description</nz-form-label>
          <nz-form-control nzErrorTip="Required">
            <textarea nz-input formControlName="detailedDescription" rows="4"></textarea>
          </nz-form-control>
        </nz-form-item>
        <div class="flex justify-end gap-2">
          <button nz-button type="button" (click)="closeIntakeModal()">Cancel</button>
          <button nz-button nzType="primary" [nzLoading]="intakeSaving()" (click)="submitIntake()">Save</button>
        </div>
      </form>
      </ng-container>
    </nz-modal>

    <nz-modal
      [nzVisible]="outcomeModalOpen()"
      nzTitle="Add Outcome"
      [nzFooter]="null"
      (nzOnCancel)="closeOutcomeModal()"
    >
    <ng-container *nzModalContent>
      <form nz-form [formGroup]="outcomeForm" nzLayout="vertical">
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Outcome Type</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-select formControlName="outcomeType" nzPlaceHolder="Select outcome type">
  <nz-option nzValue="OTHER" nzLabel="Other"></nz-option>
  <nz-option nzValue="REFERRED" nzLabel="Referred"></nz-option>
  <nz-option nzValue="DISCIPLINARY_ACTION" nzLabel="Disciplinary Action"></nz-option>
  <nz-option nzValue="WITHDRAWN" nzLabel="Withdrawn"></nz-option>
  <nz-option nzValue="RESOLVED_INFORMALLY" nzLabel="Resolved Informally"></nz-option>
  <nz-option nzValue="POLICY_BREACH_CONFIRMED" nzLabel="Policy Breach Confirmed"></nz-option>
  <nz-option nzValue="NO_BREACH_FOUND" nzLabel="No Breach Found"></nz-option>
</nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Decided By</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-select formControlName="decidedBy" nzShowSearch nzAllowClear>
                  <nz-option *ngFor="let emp of employees()" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Decision Date</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-date-picker formControlName="decisionAt" nzShowTime style="width: 100%"></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Action Taken</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <input nz-input formControlName="actionTaken" />
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
        <nz-form-item>
          <nz-form-label nzRequired>Decision Summary</nz-form-label>
          <nz-form-control nzErrorTip="Required">
            <textarea nz-input formControlName="decisionSummary" rows="4"></textarea>
          </nz-form-control>
        </nz-form-item>
        <div class="flex justify-end gap-2">
          <button nz-button type="button" (click)="closeOutcomeModal()">Cancel</button>
          <button nz-button nzType="primary" [nzLoading]="outcomeSaving()" (click)="submitOutcome()">Save</button>
        </div>
      </form>
      </ng-container>
    </nz-modal>

    <nz-modal
      [nzVisible]="taskModalOpen()"
      nzTitle="Add Task"
      [nzFooter]="null"
      (nzOnCancel)="closeTaskModal()"
    >
    <ng-container *nzModalContent>
      <form nz-form [formGroup]="taskForm" nzLayout="vertical">
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Title</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <input nz-input formControlName="title" />
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Type</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-select formControlName="taskType" nzPlaceHolder="Select task type">
  <nz-option nzValue="INTERVIEW_COMPLAINANT" nzLabel="Interview Complainant"></nz-option>
  <nz-option nzValue="ISSUE_DECISION_LETTER" nzLabel="Issue Decision Letter"></nz-option>
  <nz-option nzValue="COMMUNICATE_OUTCOME" nzLabel="Communicate Outcome"></nz-option>
  <nz-option nzValue="INVESTIGATION_SUMMARY" nzLabel="Investigation Summary"></nz-option>
  <nz-option nzValue="REVIEW_OUTCOME" nzLabel="Review Outcome"></nz-option>
  <nz-option nzValue="COLLECT_EVIDENCE" nzLabel="Collect Evidence"></nz-option>
  <nz-option nzValue="TRIAGE_ASSESSMENT" nzLabel="Triage Assessment"></nz-option>
  <nz-option nzValue="INTERVIEW_SUBJECT" nzLabel="Interview Subject"></nz-option>
  <nz-option nzValue="RECORD_MINUTES" nzLabel="Record Minutes"></nz-option>
  <nz-option nzValue="COMPLETE_INTAKE" nzLabel="Complete Intake"></nz-option>
  <nz-option nzValue="ACKNOWLEDGE_CASE" nzLabel="Acknowledge Case"></nz-option>
  <nz-option nzValue="DRAFT_OUTCOME" nzLabel="Draft Outcome"></nz-option>
  <nz-option nzValue="CLOSE_CASE" nzLabel="Close Case"></nz-option>
  <nz-option nzValue="CONDUCT_HEARING" nzLabel="Conduct Hearing"></nz-option>
  <nz-option nzValue="INTERVIEW_WITNESS" nzLabel="Interview Witness"></nz-option>
  <nz-option nzValue="REVIEW_EVIDENCE" nzLabel="Review Evidence"></nz-option>
  <nz-option nzValue="APPROVE_OUTCOME" nzLabel="Approve Outcome"></nz-option>
  <nz-option nzValue="FOLLOW_UP" nzLabel="Follow Up"></nz-option>
  <nz-option nzValue="SCHEDULE_HEARING" nzLabel="Schedule Hearing"></nz-option>
  <nz-option nzValue="SCHEDULE_MEETING" nzLabel="Schedule Meeting"></nz-option>
  <nz-option nzValue="CONDUCT_MEETING" nzLabel="Conduct Meeting"></nz-option>
</nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Assigned To</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-select formControlName="assignedTo" nzShowSearch nzAllowClear>
                  <nz-option *ngFor="let emp of employees()" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label>Due Date</nz-form-label>
              <nz-form-control>
                <nz-date-picker formControlName="dueAt" nzShowTime style="width: 100%"></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
        <nz-form-item>
          <nz-form-label>Description</nz-form-label>
          <nz-form-control>
            <textarea nz-input formControlName="description" rows="3"></textarea>
          </nz-form-control>
        </nz-form-item>
        <div class="flex justify-end gap-2">
          <button nz-button type="button" (click)="closeTaskModal()">Cancel</button>
          <button nz-button nzType="primary" [nzLoading]="taskSaving()" (click)="submitTask()">Save</button>
        </div>
      </form>
      </ng-container>
    </nz-modal>

    <nz-modal
      [nzVisible]="assignModalOpen()"
      nzTitle="Assign Case"
      [nzFooter]="null"
      (nzOnCancel)="closeAssignModal()"
    >
    <ng-container *nzModalContent>
      <form nz-form [formGroup]="assignForm" nzLayout="vertical">
        <nz-form-item>
          <nz-form-label nzRequired>Assign To</nz-form-label>
          <nz-form-control nzErrorTip="Please select an officer">
            <nz-select formControlName="assignedToUser" nzShowSearch nzAllowClear placeholder="Select an officer">
              <nz-option *ngFor="let emp of employees()" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>
        <nz-form-item>
          <nz-form-label nzRequired>Assignment Notes</nz-form-label>
          <nz-form-control nzErrorTip="Please provide notes">
            <textarea nz-input formControlName="notes" rows="4" placeholder="Enter assignment notes..."></textarea>
          </nz-form-control>
        </nz-form-item>
        <div class="flex justify-end gap-2">
          <button nz-button type="button" (click)="closeAssignModal()">Cancel</button>
          <button nz-button nzType="primary" [nzLoading]="assignSaving()" (click)="submitAssign()">Assign</button>
        </div>
      </form>
    </ng-container>
    
      
    <nz-modal
      [(nzVisible)]="docLinkModalOpen"
      nzTitle="Link Document"
      (nzOnCancel)="closeDocLinkModal()"
      (nzOnOk)="submitDocLink()"
      [nzOkLoading]="docLinkSaving()"
    >
      <ng-container *nzModalContent>
        <form nz-form [formGroup]="docLinkForm" nzLayout="vertical">
          <nz-form-item>
            <nz-form-label nzRequired>Document ID</nz-form-label>
            <nz-form-control>
              <nz-input-number formControlName="documentId" style="width: 100%"></nz-input-number>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label nzRequired>Visibility</nz-form-label>
            <nz-form-control>
              <nz-select formControlName="visibility">
                <nz-option nzValue="INTERNAL_ONLY" nzLabel="Internal Only"></nz-option>
                <nz-option nzValue="VISIBLE_TO_SUBJECT" nzLabel="Visible to Subject"></nz-option>
                <nz-option nzValue="VISIBLE_TO_ALL_PARTIES" nzLabel="Visible to All Parties"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label>Notes</nz-form-label>
            <nz-form-control>
              <textarea nz-input formControlName="notes" rows="2"></textarea>
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .mb-4 { margin-bottom: 16px; }
  `]
})
export class CaseViewComponent implements OnInit {
  case: WritableSignal<ErCase | null> = signal(null);
  loading: WritableSignal<boolean> = signal(true);
  intakeSaving: WritableSignal<boolean> = signal(false);
  outcomeSaving: WritableSignal<boolean> = signal(false);
  taskSaving: WritableSignal<boolean> = signal(false);
  assignSaving: WritableSignal<boolean> = signal(false);
  intakeModalOpen: WritableSignal<boolean> = signal(false);
  outcomeModalOpen: WritableSignal<boolean> = signal(false);
  taskModalOpen: WritableSignal<boolean> = signal(false);
  assignModalOpen: WritableSignal<boolean> = signal(false);
  employees: WritableSignal<Employee[]> = signal([]);
  intakeForm: FormGroup;
  outcomeForm: FormGroup;
  taskForm: FormGroup;
  assignForm: FormGroup;
  docLinkForm: FormGroup;
  docLinkModalOpen = signal(false);
  docLinkSaving = signal(false);
  docLinkContext: 'INTAKE' | 'OUTCOME' = 'INTAKE';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private caseService: ErCaseService,
    private processService: ErProcessService,
    private employeeService: EmployeesService,
    private message: NzMessageService
  ) {
    this.intakeForm = this.fb.group({
      incidentDateFrom: [null, [Validators.required]],
      incidentDateTo: [null],
      incidentLocation: [null, [Validators.required]],
      detailedDescription: [null, [Validators.required]],
      triageDecision: ['PROCEED_TO_INVESTIGATION', [Validators.required]],
      triageNotes: ['Initial evidence suggests a valid claim.']
    });

    this.outcomeForm = this.fb.group({
      outcomeType: [null, [Validators.required]],
      decisionSummary: [null, [Validators.required]],
      actionTaken: [null, [Validators.required]],
      decisionAt: [new Date(), [Validators.required]],
      decidedBy: [null, [Validators.required]]
    });

    this.taskForm = this.fb.group({
      title: [null, [Validators.required]],
      taskType: ['INVESTIGATION', [Validators.required]],
      description: [''],
      assignedTo: [null, [Validators.required]],
      dueAt: [null]
    });

    this.assignForm = this.fb.group({
      assignedToUser: [null, [Validators.required]],
      notes: ['', [Validators.required]]
    });

    this.docLinkForm = this.fb.group({
      documentId: [null, [Validators.required]],
      visibility: ['INTERNAL_ONLY', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadCase(id);
    }
    this.employeeService.getAll().subscribe(data => this.employees.set(data));
  }

  loadCase(id: number): void {
    this.loading.set(true);
    this.caseService.getCase(id).subscribe({
      next: (data) => {
        this.case.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Failed to load case');
        this.loading.set(false);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  submitIntake(): void {
    const erCase = this.case();
    if (!erCase) return;
    if (this.intakeForm.invalid) {
      this.markInvalid(this.intakeForm);
      return;
    }
    this.intakeSaving.set(true);
    const val = this.intakeForm.value;

    const formatDate = (date: Date) => {
      if (!date) return null;
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const payload = {
      incidentDateFrom: formatDate(val.incidentDateFrom),
      incidentDateTo: val.incidentDateTo ? formatDate(val.incidentDateTo) : null,
      incidentLocation: val.incidentLocation,
      detailedDescription: val.detailedDescription,
      triageDecision: val.triageDecision,
      triageNotes: val.triageNotes
    };

    this.processService.addIntake(erCase.id, payload).subscribe({
      next: (data) => {
        const updated = { ...erCase, intake: data };
        this.case.set(updated);
        this.intakeSaving.set(false);
        this.message.success('Intake added');
        this.resetIntakeForm();
        this.closeIntakeModal();
      },
      error: () => {
        this.message.error('Failed to add intake');
        this.intakeSaving.set(false);
      }
    });
  }

  submitOutcome(): void {
    const erCase = this.case();
    if (!erCase) return;
    if (this.outcomeForm.invalid) {
      this.markInvalid(this.outcomeForm);
      return;
    }
    this.outcomeSaving.set(true);
    const val = this.outcomeForm.value;
    const payload = {
      outcomeType: val.outcomeType,
      decisionSummary: val.decisionSummary,
      actionTaken: val.actionTaken,
      decisionAt: val.decisionAt.toISOString(),
      decidedBy: { id: val.decidedBy }
    };
    this.processService.addOutcome(erCase.id, payload).subscribe({
      next: (data) => {
        const updated = { ...erCase, outcome: data };
        this.case.set(updated);
        this.outcomeSaving.set(false);
        this.message.success('Outcome added');
        this.resetOutcomeForm();
        this.closeOutcomeModal();
      },
      error: () => {
        this.message.error('Failed to add outcome');
        this.outcomeSaving.set(false);
      }
    });
  }

  submitTask(): void {
    const erCase = this.case();
    if (!erCase) return;
    if (this.taskForm.invalid) {
      this.markInvalid(this.taskForm);
      return;
    }
    this.taskSaving.set(true);
    const val = this.taskForm.value;
    const payload = {
      title: val.title,
      taskType: val.taskType,
      description: val.description,
      assignedTo: { id: val.assignedTo },
      dueAt: val.dueAt ? val.dueAt.toISOString() : null
    };
    this.processService.addTask(erCase.id, payload).subscribe({
      next: (data) => {
        const updated = { ...erCase, tasks: [...(erCase.tasks || []), data] };
        this.case.set(updated);
        this.taskSaving.set(false);
        this.message.success('Task added');
        this.resetTaskForm();
        this.closeTaskModal();
      },
      error: () => {
        this.message.error('Failed to add task');
        this.taskSaving.set(false);
      }
    });
  }

  submitAssign(): void {
    const erCase = this.case();
    if (!erCase) return;
    if (this.assignForm.invalid) {
      this.markInvalid(this.assignForm);
      return;
    }
    this.assignSaving.set(true);
    const val = this.assignForm.value;
    const payload = {
      assignedToUser: { id: val.assignedToUser },
      notes: val.notes
    };
    this.processService.assignCase(erCase.id, payload).subscribe({
      next: (data) => {
        const updated = { ...erCase, assignedToUser: data.assignedToUser, status: data.status };
        this.case.set(updated);
        this.assignSaving.set(false);
        this.message.success('Case assigned successfully');
        this.closeAssignModal();
      },
      error: () => {
        this.message.error('Failed to assign case');
        this.assignSaving.set(false);
      }
    });
  }

  openAssignModal(): void {
    this.assignModalOpen.set(true);
  }

  closeAssignModal(): void {
    this.assignModalOpen.set(false);
  }

  openIntakeModal(): void {
    this.intakeModalOpen.set(true);
  }

  closeIntakeModal(): void {
    this.intakeModalOpen.set(false);
  }

  openOutcomeModal(): void {
    this.outcomeModalOpen.set(true);
  }

  closeOutcomeModal(): void {
    this.outcomeModalOpen.set(false);
  }

  openTaskModal(): void {
    this.taskModalOpen.set(true);
  }

  closeTaskModal(): void {
    this.taskModalOpen.set(false);
  }

  openDocLinkModal(context: 'INTAKE' | 'OUTCOME'): void {
    this.docLinkContext = context;
    this.docLinkModalOpen.set(true);
    this.docLinkForm.reset({ visibility: 'INTERNAL_ONLY' });
  }

  closeDocLinkModal(): void {
    this.docLinkModalOpen.set(false);
  }

  submitDocLink(): void {
    if (this.docLinkForm.invalid) {
      this.markInvalid(this.docLinkForm);
      return;
    }

    const erCase = this.case();
    if (!erCase) return;

    this.docLinkSaving.set(true);
    const val = this.docLinkForm.value;
    const dto = {
      document: { id: val.documentId },
      visibility: val.visibility,
      notes: val.notes
    };

    let obs;
    if (this.docLinkContext === 'INTAKE' && erCase.intake?.id) {
      obs = this.processService.addIntakeDocument(erCase.intake.id, dto);
    } else if (this.docLinkContext === 'OUTCOME' && erCase.outcome?.id) {
      obs = this.processService.addOutcomeDocument(erCase.outcome.id, dto);
    } else {
      this.message.error('Entity ID not found');
      this.docLinkSaving.set(false);
      return;
    }

    obs.subscribe({
      next: () => {
        this.message.success('Document linked successfully');
        this.docLinkSaving.set(false);
        this.closeDocLinkModal();
        this.loadCase(erCase.id!);
      },
      error: () => {
        this.message.error('Failed to link document');
        this.docLinkSaving.set(false);
      }
    });
  }

  private resetIntakeForm(): void {
    this.intakeForm.reset({
      incidentDateFrom: null,
      incidentDateTo: null,
      incidentLocation: null,
      detailedDescription: null,
      triageDecision: 'PROCEED_TO_INVESTIGATION',
      triageNotes: 'Initial evidence suggests a valid claim.'
    });
  }

  private resetOutcomeForm(): void {
    this.outcomeForm.reset({
      outcomeType: null,
      decisionSummary: null,
      actionTaken: null,
      decisionAt: new Date(),
      decidedBy: null
    });
  }

  private resetTaskForm(): void {
    this.taskForm.reset({
      title: null,
      taskType: 'INVESTIGATION',
      description: '',
      assignedTo: null,
      dueAt: null
    });
  }

  private markInvalid(form: FormGroup): void {
    Object.values(form.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }
}
