import { Component, OnInit } from '@angular/core';
import { OhsService } from '../../services/ohs.service';
import { SafetyIncident } from '../../models/ohs.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-safety-incident-list',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">Safety Incidents</h1>
      <button nz-button nzType="primary" routerLink="create">Report Incident</button>
    </div>

    <nz-table #table [nzData]="incidents" [nzLoading]="loading">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Severity</th>
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
            <nz-tag [nzColor]="getSeverityColor(data.severity)">{{ data.severity }}</nz-tag>
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
export class SafetyIncidentListComponent implements OnInit {
  incidents: SafetyIncident[] = [];
  loading = false;

  constructor(private ohsService: OhsService, private message: NzMessageService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.ohsService.getSafetyIncidents().subscribe({
      next: (data) => {
        this.incidents = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load incidents');
        this.loading = false;
      }
    });
  }

  submit(incident: SafetyIncident) {
    this.ohsService.submitSafetyIncident(incident).subscribe({
      next: () => {
        this.message.success('Incident submitted');
        this.loadData();
      },
      error: () => this.message.error('Failed to submit incident')
    });
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'red';
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
