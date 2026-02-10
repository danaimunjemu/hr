import { Component, OnInit } from '@angular/core';
import { OhsService } from '../../services/ohs.service';
import { NearMissReport } from '../../models/ohs.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-near-miss-list',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">Near Miss Reports</h1>
      <button nz-button nzType="primary" routerLink="create">Report Near Miss</button>
    </div>

    <nz-table #table [nzData]="reports" [nzLoading]="loading">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Potential Severity</th>
          <th>Status</th>
          <th>Reported By</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let data of table.data">
          <td>{{ data.incidentDate | date }}</td>
          <td>{{ data.description }}</td>
          <td>
            <nz-tag [nzColor]="getSeverityColor(data.potentialSeverity)">{{ data.potentialSeverity }}</nz-tag>
          </td>
          <td>
            <nz-tag [nzColor]="getStatusColor(data.status)">{{ data.status }}</nz-tag>
          </td>
          <td>{{ data.reportedBy }}</td>
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
export class NearMissListComponent implements OnInit {
  reports: NearMissReport[] = [];
  loading = false;

  constructor(private ohsService: OhsService, private message: NzMessageService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.ohsService.getNearMissReports().subscribe({
      next: (data) => {
        this.reports = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load reports');
        this.loading = false;
      }
    });
  }

  submit(report: NearMissReport) {
    this.ohsService.submitNearMissReport(report).subscribe({
      next: () => {
        this.message.success('Report submitted');
        this.loadData();
      },
      error: () => this.message.error('Failed to submit report')
    });
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'gold';
      default: return 'green';
    }
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
