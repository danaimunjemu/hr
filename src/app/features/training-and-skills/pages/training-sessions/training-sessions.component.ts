import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrainingService } from '../../services/training.service';
import { TrainingSession } from '../../models/training.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-training-sessions',
  standalone: false,
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Training Sessions</h1>
        <button nz-button nzType="primary" (click)="openCreateModal()">
          <span nz-icon nzType="plus"></span> Schedule Session
        </button>
      </div>

      <nz-table #basicTable [nzData]="sessions" [nzLoading]="loading">
        <thead>
          <tr>
            <th>Date</th>
            <th>Program</th>
            <th>Time</th>
            <th>Location</th>
            <th>Trainer</th>
            <th>Enrolled</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data">
            <td>{{ data.date | date }}</td>
            <td>{{ data.programName }}</td>
            <td>{{ data.startTime }} - {{ data.endTime }}</td>
            <td>{{ data.location }}</td>
            <td>{{ data.trainer }}</td>
            <td>{{ data.enrolledCount }} / {{ data.capacity }}</td>
            <td>
              <nz-tag [nzColor]="getStatusColor(data.status)">{{ data.status }}</nz-tag>
            </td>
            <td>
              <a (click)="viewDetails(data)">View</a>
              <nz-divider nzType="vertical"></nz-divider>
              <a nz-popconfirm nzPopconfirmTitle="Cancel this session?" (nzOnConfirm)="cancelSession(data.id)">Cancel</a>
            </td>
          </tr>
        </tbody>
      </nz-table>

      <!-- Modal -->
      <nz-modal
        [(nzVisible)]="isVisible"
        [nzTitle]="'Schedule New Session'"
        (nzOnCancel)="handleCancel()"
        (nzOnOk)="handleOk()"
        [nzOkLoading]="isOkLoading"
      >
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="sessionForm" nzLayout="vertical">
            <nz-form-item>
              <nz-form-label nzRequired>Program</nz-form-label>
              <nz-form-control nzErrorTip="Please select a program!">
                <nz-select formControlName="programId" nzPlaceHolder="Select Program">
                  <nz-option *ngFor="let prog of programs" [nzValue]="prog.id" [nzLabel]="prog.name"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>

            <div class="grid grid-cols-2 gap-4">
              <nz-form-item>
                <nz-form-label nzRequired>Date</nz-form-label>
                <nz-form-control>
                  <nz-date-picker formControlName="date" style="width: 100%"></nz-date-picker>
                </nz-form-control>
              </nz-form-item>
              
              <nz-form-item>
                <nz-form-label nzRequired>Trainer</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="trainer" />
                </nz-form-control>
              </nz-form-item>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <nz-form-item>
                <nz-form-label nzRequired>Start Time</nz-form-label>
                <nz-form-control>
                  <input nz-input type="time" formControlName="startTime" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label nzRequired>End Time</nz-form-label>
                <nz-form-control>
                  <input nz-input type="time" formControlName="endTime" />
                </nz-form-control>
              </nz-form-item>
            </div>

            <nz-form-item>
              <nz-form-label nzRequired>Location</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="location" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label nzRequired>Capacity</nz-form-label>
              <nz-form-control>
                <nz-input-number formControlName="capacity" [nzMin]="1" style="width: 100%"></nz-input-number>
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>
    </div>
  `
})
export class TrainingSessionsComponent implements OnInit {
  sessions: TrainingSession[] = [];
  programs: any[] = [];
  loading = false;
  isVisible = false;
  isOkLoading = false;
  sessionForm: FormGroup;

  constructor(
    private trainingService: TrainingService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.sessionForm = this.fb.group({
      programId: ['', [Validators.required]],
      date: [new Date(), [Validators.required]],
      startTime: ['09:00', [Validators.required]],
      endTime: ['17:00', [Validators.required]],
      location: ['', [Validators.required]],
      trainer: ['', [Validators.required]],
      capacity: [20, [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadData();
    this.trainingService.getPrograms().subscribe(progs => this.programs = progs);
  }

  loadData() {
    this.loading = true;
    this.trainingService.getSessions().subscribe({
      next: (data) => {
        this.sessions = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'blue';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  }

  openCreateModal() {
    this.sessionForm.reset({ capacity: 20, startTime: '09:00', endTime: '17:00' });
    this.isVisible = true;
  }

  handleCancel() {
    this.isVisible = false;
  }

  handleOk() {
    if (this.sessionForm.valid) {
      this.isOkLoading = true;
      const val = this.sessionForm.value;
      const payload = {
        ...val,
        date: val.date.toISOString().split('T')[0]
      };
      
      this.trainingService.createSession(payload).subscribe({
        next: () => {
          this.message.success('Session scheduled');
          this.isVisible = false;
          this.isOkLoading = false;
          this.loadData();
        },
        error: () => this.isOkLoading = false
      });
    } else {
      Object.values(this.sessionForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  cancelSession(id: string) {
    this.message.info('Cancel functionality not implemented in dummy service');
  }

  viewDetails(session: TrainingSession) {
    this.message.info(`Viewing details for session: ${session.programName}`);
  }
}
