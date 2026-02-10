import { Component, OnInit } from '@angular/core';
import { OhsService } from '../../services/ohs.service';
import { MedicalSurveillance } from '../../models/ohs.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-medical-surveillance-list',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">Medical Surveillance</h1>
      <button nz-button nzType="primary" routerLink="create">New Record</button>
    </div>

    <nz-table #table [nzData]="records" [nzLoading]="loading">
      <thead>
        <tr>
          <th>Date</th>
          <th>Employee ID</th>
          <th>Type</th>
          <th>Result</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let data of table.data">
          <td>{{ data.checkupDate | date }}</td>
          <td>{{ data.employeeId }}</td>
          <td>{{ data.type }}</td>
          <td>{{ data.result }}</td>
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
  records: MedicalSurveillance[] = [];
  loading = false;

  constructor(private ohsService: OhsService, private message: NzMessageService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.ohsService.getMedicalSurveillances().subscribe({
      next: (data) => {
        this.records = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load records');
        this.loading = false;
      }
    });
  }

  submit(record: MedicalSurveillance) {
    this.ohsService.submitMedicalSurveillance(record).subscribe({
      next: () => {
        this.message.success('Record submitted');
        this.loadData();
      },
      error: () => this.message.error('Failed to submit record')
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED': return 'green';
      case 'REJECTED': return 'red';
      case 'SUBMITTED': return 'blue';
      default: return 'default';
    }
  }
}
