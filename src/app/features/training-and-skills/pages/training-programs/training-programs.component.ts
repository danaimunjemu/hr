import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrainingService } from '../../services/training.service';
import { TrainingProgram } from '../../models/training.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-training-programs',
  standalone: false,
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Training Programs</h1>
        <button nz-button nzType="primary" (click)="openCreateModal()">
          <span nz-icon nzType="plus"></span> Add Program
        </button>
      </div>

      <nz-table #basicTable [nzData]="programs" [nzLoading]="loading">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Category</th>
            <th>Duration (Hours)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data">
            <td>{{ data.name }}</td>
            <td><nz-tag [nzColor]="getTypeColor(data.trainingType)">{{ data.trainingType }}</nz-tag></td>
            <td>{{ data.category }}</td>
            <td>{{ data.durationHours }}</td>
            <td>
              <nz-badge [nzStatus]="data.active ? 'success' : 'default'" [nzText]="data.active ? 'Active' : 'Inactive'"></nz-badge>
            </td>
            <td>
              <a (click)="editProgram(data)">Edit</a>
              <nz-divider nzType="vertical"></nz-divider>
              <a nz-popconfirm nzPopconfirmTitle="Delete this program?" (nzOnConfirm)="deleteProgram(data.id)">Delete</a>
            </td>
          </tr>
        </tbody>
      </nz-table>

      <!-- Modal -->
      <nz-modal
        [(nzVisible)]="isVisible"
        [nzTitle]="isEdit ? 'Edit Program' : 'New Program'"
        (nzOnCancel)="handleCancel()"
        (nzOnOk)="handleOk()"
        [nzOkLoading]="isOkLoading"
      >
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="programForm" nzLayout="vertical">
            <nz-form-item>
              <nz-form-label nzRequired>Program Name</nz-form-label>
              <nz-form-control nzErrorTip="Please input program name!">
                <input nz-input formControlName="name" />
              </nz-form-control>
            </nz-form-item>
            
            <nz-form-item>
              <nz-form-label>Description</nz-form-label>
              <nz-form-control>
                <textarea nz-input formControlName="description" rows="3"></textarea>
              </nz-form-control>
            </nz-form-item>

            <div class="grid grid-cols-2 gap-4">
              <nz-form-item>
                <nz-form-label nzRequired>Type</nz-form-label>
                <nz-form-control>
                  <nz-select formControlName="trainingType">
                    <nz-option nzValue="MANDATORY" nzLabel="Mandatory"></nz-option>
                    <nz-option nzValue="OPTIONAL" nzLabel="Optional"></nz-option>
                    <nz-option nzValue="CERTIFICATION" nzLabel="Certification"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label nzRequired>Category</nz-form-label>
                <nz-form-control>
                  <nz-select formControlName="category">
                    <nz-option nzValue="TECHNICAL" nzLabel="Technical"></nz-option>
                    <nz-option nzValue="SOFT_SKILLS" nzLabel="Soft Skills"></nz-option>
                    <nz-option nzValue="COMPLIANCE" nzLabel="Compliance"></nz-option>
                    <nz-option nzValue="LEADERSHIP" nzLabel="Leadership"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <nz-form-item>
                <nz-form-label nzRequired>Duration (Hours)</nz-form-label>
                <nz-form-control>
                  <nz-input-number formControlName="durationHours" [nzMin]="1" style="width: 100%"></nz-input-number>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label>Active</nz-form-label>
                <nz-form-control>
                  <nz-switch formControlName="active"></nz-switch>
                </nz-form-control>
              </nz-form-item>
            </div>
          </form>
        </ng-container>
      </nz-modal>
    </div>
  `
})
export class TrainingProgramsComponent implements OnInit {
  programs: TrainingProgram[] = [];
  loading = false;
  isVisible = false;
  isOkLoading = false;
  isEdit = false;
  programForm: FormGroup;
  currentId: string | null = null;

  constructor(
    private trainingService: TrainingService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.programForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      trainingType: ['OPTIONAL', [Validators.required]],
      category: ['TECHNICAL', [Validators.required]],
      durationHours: [1, [Validators.required]],
      active: [true]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.trainingService.getPrograms().subscribe({
      next: (data) => {
        this.programs = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'MANDATORY': return 'red';
      case 'CERTIFICATION': return 'gold';
      default: return 'blue';
    }
  }

  openCreateModal() {
    this.isEdit = false;
    this.currentId = null;
    this.programForm.reset({ active: true, durationHours: 1, trainingType: 'OPTIONAL', category: 'TECHNICAL' });
    this.isVisible = true;
  }

  editProgram(data: TrainingProgram) {
    this.isEdit = true;
    this.currentId = data.id;
    this.programForm.patchValue(data);
    this.isVisible = true;
  }

  handleCancel() {
    this.isVisible = false;
  }

  handleOk() {
    if (this.programForm.valid) {
      this.isOkLoading = true;
      const val = this.programForm.value;
      
      if (this.isEdit && this.currentId) {
        this.trainingService.updateProgram(this.currentId, val).subscribe({
          next: () => {
            this.message.success('Program updated');
            this.isVisible = false;
            this.isOkLoading = false;
            this.loadData();
          },
          error: () => this.isOkLoading = false
        });
      } else {
        this.trainingService.createProgram(val).subscribe({
          next: () => {
            this.message.success('Program created');
            this.isVisible = false;
            this.isOkLoading = false;
            this.loadData();
          },
          error: () => this.isOkLoading = false
        });
      }
    } else {
      Object.values(this.programForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  deleteProgram(id: string) {
    this.trainingService.deleteProgram(id).subscribe(() => {
      this.message.success('Program deleted');
      this.loadData();
    });
  }
}
