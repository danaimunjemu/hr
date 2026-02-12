import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { OhsService } from '../../services/ohs.service';
import { NearMissReport } from '../../models/ohs.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-near-miss-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Near Miss Reports</h1>
      <button nz-button nzType="primary" routerLink="create">Report Near Miss</button>
    </div>

    <nz-table #table [nzData]="reports()" [nzLoading]="loading()">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Potential Severity</th>
          <th>Status</th>
          <th>Location</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let data of table.data">
          <td>{{ data.incidentDateTime | date }}</td>
          <td>{{ data.description }}</td>
          <td>
            <nz-tag [nzColor]="getSeverityColor(data.potentialSeverity)">{{ data.potentialSeverity }}</nz-tag>
          </td>
          <td>
            <nz-tag [nzColor]="getStatusColor(data.status)">{{ data.status }}</nz-tag>
          </td>
          <td>{{ data.location }}</td>
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
  reports = signal<NearMissReport[]>([]);
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
    this.ohsService.getNearMissReports()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.reports.set(data);
        },
        error: () => this.message.error('Failed to load reports')
      });
  }

  submit(report: NearMissReport) {
    this.loading.set(true);
    this.ohsService.submitNearMissReport(report)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Report submitted');
          this.loadData();
        },
        error: () => this.message.error('Failed to submit report')
      });
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'orange';
      default: return 'green';
    }
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
