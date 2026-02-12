import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { OhsService } from '../../services/ohs.service';
import { MedicalSurveillance } from '../../models/ohs.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-medical-surveillance-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Medical Surveillance</h1>
      <button nz-button nzType="primary" routerLink="create">New Record</button>
    </div>

    <nz-table #table [nzData]="records()" [nzLoading]="loading()">
      <thead>
        <tr>
          <th>Employee ID</th>
          <th>Checkup Date</th>
          <th>Type</th>
          <th>Result</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let data of table.data">
          <td>{{ data.employee }}</td>
          <td>{{ data.examinationDate | date }}</td>
          <td>{{ data.examinationType }}</td>
          <td>
            <nz-tag [nzColor]="data.fitnessStatus ? 'red' : 'green'">{{ data.fitnessStatus }}</nz-tag>
          </td>
          <td>
            <nz-tag [nzColor]="getStatusColor(data.status)">{{ data.status }}</nz-tag>
          </td>
          <td>
            <a [routerLink]="['view', data.id]">View</a>
            <nz-divider nzType="vertical" *ngIf="data.status === 'DRAFT'"></nz-divider>
            <a *ngIf="data.status === 'DRAFT'" (click)="submit(data)">Submit</a>
          </td>
        </tr>
      </tbody>
    </nz-table>
  `
})
export class MedicalSurveillanceListComponent implements OnInit {
  records = signal<MedicalSurveillance[]>([]);
  loading = signal(false);

  constructor(
    private ohsService: OhsService, 
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.ohsService.getMedicalSurveillances()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.records.set(data);
        },
        error: () => this.message.error('Failed to load records')
      });
  }

  submit(record: MedicalSurveillance) {
    this.loading.set(true);
    this.ohsService.submitMedicalSurveillance(record)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Record submitted');
          this.loadData();
        },
        error: () => this.message.error('Failed to submit record')
      });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'SUBMITTED': return 'processing';
      default: return 'default';
    }
  }
}
