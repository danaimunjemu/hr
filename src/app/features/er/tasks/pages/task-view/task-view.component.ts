import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErTaskService } from '../../services/er-task.service';
import { ErProcessService } from '../../../process/services/er-process.service';
import { ErTask } from '../../models/er-task.model';
import { EmployeesService, Employee } from '../../../../employees/services/employees.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-task-view',
  standalone: false,
  template: `
    <nz-page-header (nzBack)="onBack()" nzBackIcon nzTitle="Task Details">
      <nz-page-header-extra>
        <button nz-button nzType="default" (click)="onEdit()">Edit</button>
        <button nz-button (click)="openParticipantModal()">Add Participant</button>
        <button nz-button (click)="openDocumentModal()">Link Document</button>
        <button 
          *ngIf="task()?.status !== 'COMPLETED' && task()?.status !== 'CANCELLED'"
          nz-button 
          nzType="primary" 
          (click)="openCompleteModal()"
        >
          Complete Task
        </button>
      </nz-page-header-extra>
    </nz-page-header>

    <nz-tabs nzLinkRouter class="mb-4">
      <nz-tab nzTitle="Details" [routerLink]="['./']"></nz-tab>
      <nz-tab nzTitle="Parties" [routerLink]="['./parties']"></nz-tab>
    </nz-tabs>

    <nz-spin [nzSpinning]="loading()">
      <div *ngIf="task() as task">
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="16">
            <nz-card nzTitle="General Information" class="mb-4">
              <nz-descriptions [nzColumn]="1" nzBordered>
                <nz-descriptions-item nzTitle="Title">{{ task.title }}</nz-descriptions-item>
                <nz-descriptions-item nzTitle="Case ID">
                  <a *ngIf="task.erCase" [routerLink]="['/app/employee-relations/cases/view', task.erCase.id]">#{{ task.erCase.id }}</a>
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Description">{{ task.description || 'N/A' }}</nz-descriptions-item>
                <nz-descriptions-item nzTitle="Type">
                  <nz-tag>{{ task.taskType }}</nz-tag>
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Status">
                  <nz-tag>{{ task.status }}</nz-tag>
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Due Date">{{ task.dueAt | date:'medium' }}</nz-descriptions-item>
              </nz-descriptions>
            </nz-card>
            
            <nz-card nzTitle="Completion Details" class="mb-4" *ngIf="task.completionNotes">
               <p>{{ task.completionNotes }}</p>
            </nz-card>
          </div>
          
          <div nz-col [nzSpan]="8">
            <nz-card nzTitle="Assignment" class="mb-4">
              <nz-descriptions [nzColumn]="1" nzBordered>
                <nz-descriptions-item nzTitle="Assigned To">
                  {{ task.assignedTo.firstName }} {{ task.assignedTo.lastName }}
                </nz-descriptions-item>
              </nz-descriptions>
            </nz-card>
          </div>
        </div>
      </div>
    </nz-spin>

    <router-outlet></router-outlet>

    <nz-modal
      [(nzVisible)]="completeModalVisible"
      nzTitle="Complete Task"
      (nzOnCancel)="completeModalVisible = false"
      (nzOnOk)="submitCompletion()"
      [nzOkLoading]="completing()"
    >
      <ng-container *nzModalContent>
        <form nz-form [formGroup]="completeForm" nzLayout="vertical">
          <nz-form-item>
            <nz-form-label nzRequired>Completion Notes</nz-form-label>
            <nz-form-control nzErrorTip="Please enter completion notes">
              <textarea nz-input formControlName="notes" rows="4" placeholder="Enter details about task completion..."></textarea>
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>
    </nz-modal>

    <nz-modal
      [(nzVisible)]="participantModalVisible"
      nzTitle="Add Participant"
      (nzOnCancel)="participantModalVisible = false"
      (nzOnOk)="submitParticipant()"
      [nzOkLoading]="savingParticipant()"
    >
      <ng-container *nzModalContent>
        <form nz-form [formGroup]="participantForm" nzLayout="vertical">
          <nz-form-item>
            <nz-form-label nzRequired>Employee</nz-form-label>
            <nz-form-control>
              <nz-select formControlName="employeeId" nzShowSearch nzPlaceHolder="Select employee">
                <nz-option *ngFor="let emp of employees()" [nzValue]="emp.id" [nzLabel]="emp.firstName + ' ' + emp.lastName"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label nzRequired>Role</nz-form-label>
            <nz-form-control>
              <nz-select formControlName="role">
                <nz-option nzValue="SUBJECT" nzLabel="Subject"></nz-option>
                <nz-option nzValue="COMPLAINANT" nzLabel="Complainant"></nz-option>
                <nz-option nzValue="WITNESS" nzLabel="Witness"></nz-option>
                <nz-option nzValue="INVESTIGATOR" nzLabel="Investigator"></nz-option>
                <nz-option nzValue="CHAIRPERSON" nzLabel="Chairperson"></nz-option>
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

    <nz-modal
      [(nzVisible)]="documentModalVisible"
      nzTitle="Link Document"
      (nzOnCancel)="documentModalVisible = false"
      (nzOnOk)="submitDocument()"
      [nzOkLoading]="linkingDocument()"
    >
      <ng-container *nzModalContent>
        <form nz-form [formGroup]="documentForm" nzLayout="vertical">
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
  `
})
export class TaskViewComponent implements OnInit {
  task: WritableSignal<ErTask | null> = signal(null);
  loading: WritableSignal<boolean> = signal(false);
  completing = signal(false);
  completeModalVisible = false;
  completeForm: FormGroup;

  employees = signal<Employee[]>([]);
  savingParticipant = signal(false);
  participantModalVisible = false;
  participantForm: FormGroup;

  linkingDocument = signal(false);
  documentModalVisible = false;
  documentForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: ErTaskService,
    private processService: ErProcessService,
    private employeeService: EmployeesService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.completeForm = this.fb.group({
      notes: ['', [Validators.required]]
    });

    this.participantForm = this.fb.group({
      employeeId: [null, [Validators.required]],
      role: ['WITNESS', [Validators.required]],
      personType: ['EMPLOYEE'],
      notes: ['']
    });

    this.documentForm = this.fb.group({
      documentId: [null, [Validators.required]],
      visibility: ['INTERNAL_ONLY', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(Number(id));
    }
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe(data => this.employees.set(data));
  }

  loadData(id: number): void {
    this.loading.set(true);
    this.taskService.getTask(id).subscribe({
      next: (data) => {
        this.task.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Failed to load task details');
        this.loading.set(false);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  onEdit(): void {
    const task = this.task();
    if (task) {
      this.router.navigate(['../../edit', task.id], { relativeTo: this.route });
    }
  }

  openCompleteModal(): void {
    this.completeModalVisible = true;
    this.completeForm.reset();
  }

  submitCompletion(): void {
    if (this.completeForm.invalid) {
      Object.values(this.completeForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const task = this.task();
    if (!task) return;

    this.completing.set(true);
    this.processService.completeTask(task.id, this.completeForm.value).subscribe({
      next: () => {
        this.message.success('Task marked as completed');
        this.completing.set(false);
        this.completeModalVisible = false;
        this.loadData(task.id);
      },
      error: () => {
        this.message.error('Failed to complete task');
        this.completing.set(false);
      }
    });
  }

  openParticipantModal(): void {
    this.participantModalVisible = true;
    this.participantForm.reset({ role: 'WITNESS', personType: 'EMPLOYEE' });
  }

  submitParticipant(): void {
    if (this.participantForm.invalid) return;
    const task = this.task();
    if (!task) return;

    this.savingParticipant.set(true);
    const val = this.participantForm.value;
    const dto = {
      role: val.role,
      personType: val.personType,
      employee: { id: val.employeeId },
      notes: val.notes
    };

    this.processService.addTaskParticipant(task.id, dto).subscribe({
      next: () => {
        this.message.success('Participant added successfully');
        this.savingParticipant.set(false);
        this.participantModalVisible = false;
        this.loadData(task.id);
      },
      error: () => {
        this.message.error('Failed to add participant');
        this.savingParticipant.set(false);
      }
    });
  }

  openDocumentModal(): void {
    this.documentModalVisible = true;
    this.documentForm.reset({ visibility: 'INTERNAL_ONLY' });
  }

  submitDocument(): void {
    if (this.documentForm.invalid) return;
    const task = this.task();
    if (!task) return;

    this.linkingDocument.set(true);
    const val = this.documentForm.value;
    const dto = {
      document: { id: val.documentId },
      visibility: val.visibility,
      notes: val.notes
    };

    this.processService.addTaskDocument(task.id, dto).subscribe({
      next: () => {
        this.message.success('Document linked successfully');
        this.linkingDocument.set(false);
        this.documentModalVisible = false;
        this.loadData(task.id);
      },
      error: () => {
        this.message.error('Failed to link document');
        this.linkingDocument.set(false);
      }
    });
  }
}
