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
          </nz-descriptions>
        </nz-card>

        <nz-card nzTitle="Summary">
          <p>{{ case.summary }}</p>
        </nz-card>

        <nz-tabs class="mt-4">
          <nz-tab nzTitle="Intake">
            <ng-template nz-tab>
              <div class="mb-3">
                <button nz-button nzType="primary" (click)="openIntakeModal()">Add Intake</button>
              </div>
              <nz-card nzTitle="Intake" class="mb-4">
                <div *ngIf="case.intake; else noIntake">
                  <nz-descriptions [nzColumn]="2" nzBordered>
                    <nz-descriptions-item nzTitle="Incident Date From">{{ case.intake.incidentDateFrom | date:'medium' }}</nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Incident Date To">{{ (case.intake.incidentDateTo | date:'medium') || 'N/A' }}</nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Location">{{ case.intake.incidentLocation }}</nz-descriptions-item>
                    <nz-descriptions-item nzTitle="Logged By">
                      {{ case.intake.loggedBy?.firstName }} {{ case.intake.loggedBy?.lastName }}
                    </nz-descriptions-item>
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
              <div class="mb-3">
                <button nz-button nzType="primary" (click)="openOutcomeModal()">Add Outcome</button>
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
                        <a [routerLink]="['/employee-relations/tasks/view', task.id]">View</a>
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
              <nz-form-label nzRequired>Location</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <input nz-input formControlName="incidentLocation" />
              </nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Logged By</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-select formControlName="loggedBy" nzShowSearch nzAllowClear>
                  <nz-option *ngFor="let emp of employees()" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
        <nz-form-item>
          <nz-form-label nzRequired>Description</nz-form-label>
          <nz-form-control nzErrorTip="Required">
            <textarea nz-input formControlName="detailedDescription" rows="4"></textarea>
          </nz-form-control>
        </nz-form-item>
        <div class="flex justify-end gap-2">
          <button nz-button type="button" (click)="closeIntakeModal()">Cancel</button>
          <button nz-button nzType="primary" [nzLoading]="intakeSaving()" (click)="submitIntake()">Save</button>
        </div>
      </form>
    </nz-modal>

    <nz-modal
      [nzVisible]="outcomeModalOpen()"
      nzTitle="Add Outcome"
      [nzFooter]="null"
      (nzOnCancel)="closeOutcomeModal()"
    >
      <form nz-form [formGroup]="outcomeForm" nzLayout="vertical">
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired>Outcome Type</nz-form-label>
              <nz-form-control nzErrorTip="Required">
                <nz-select formControlName="outcomeType">
                  <nz-option nzValue="WRITTEN_WARNING" nzLabel="Written Warning"></nz-option>
                  <nz-option nzValue="VERBAL_WARNING" nzLabel="Verbal Warning"></nz-option>
                  <nz-option nzValue="DISMISSAL" nzLabel="Dismissal"></nz-option>
                  <nz-option nzValue="SUSPENSION" nzLabel="Suspension"></nz-option>
                  <nz-option nzValue="EXONERATED" nzLabel="Exonerated"></nz-option>
                  <nz-option nzValue="OTHER" nzLabel="Other"></nz-option>
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
    </nz-modal>

    <nz-modal
      [nzVisible]="taskModalOpen()"
      nzTitle="Add Task"
      [nzFooter]="null"
      (nzOnCancel)="closeTaskModal()"
    >
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
                <nz-select formControlName="taskType">
                  <nz-option nzValue="INVESTIGATION" nzLabel="Investigation"></nz-option>
                  <nz-option nzValue="REVIEW" nzLabel="Review"></nz-option>
                  <nz-option nzValue="MEETING" nzLabel="Meeting"></nz-option>
                  <nz-option nzValue="DOCUMENTATION" nzLabel="Documentation"></nz-option>
                  <nz-option nzValue="OTHER" nzLabel="Other"></nz-option>
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
  intakeModalOpen: WritableSignal<boolean> = signal(false);
  outcomeModalOpen: WritableSignal<boolean> = signal(false);
  taskModalOpen: WritableSignal<boolean> = signal(false);
  employees: WritableSignal<Employee[]> = signal([]);
  intakeForm: FormGroup;
  outcomeForm: FormGroup;
  taskForm: FormGroup;

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
      loggedBy: [null, [Validators.required]]
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
    const payload = {
      incidentDateFrom: val.incidentDateFrom.toISOString(),
      incidentDateTo: val.incidentDateTo ? val.incidentDateTo.toISOString() : null,
      incidentLocation: val.incidentLocation,
      detailedDescription: val.detailedDescription,
      loggedBy: { id: val.loggedBy }
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

  private resetIntakeForm(): void {
    this.intakeForm.reset({
      incidentDateFrom: null,
      incidentDateTo: null,
      incidentLocation: null,
      detailedDescription: null,
      loggedBy: null
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
