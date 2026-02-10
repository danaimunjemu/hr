import { Component, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { OhsService } from '../../services/ohs.service';
import { SafetyIncident } from '../../models/ohs.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-safety-incident-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Safety Incidents</h1>
      <button nz-button nzType="primary" routerLink="create">Report Incident</button>
    </div>

    <nz-table #table [nzData]="incidents()" [nzLoading]="loading()">
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
          <td>{{ data.incidentDateTime | date }}</td>
          <td>{{ data.injuryDetails }}</td>
          <td>
            <nz-tag [nzColor]="getSeverityColor(data.severity)">{{ data.severity }}</nz-tag>
          </td>
          <td>
            <nz-tag [nzColor]="getStatusColor(data.investigationStatus)">{{ data.investigationStatus }}</nz-tag>
          </td>
          <td>{{ data.reportedBy.firstName }} {{ data.reportedBy.lastName }}</td>
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
  incidents = signal<SafetyIncident[]>([]);
  loading = signal(false);

  constructor(
    private ohsService: OhsService, 
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.ohsService.getSafetyIncidents()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.incidents.set(data);
          this.cdr.markForCheck();
        },
        error: () => {
          this.message.error('Failed to load incidents');
        }
      });
  }

  submit(incident: SafetyIncident) {
    this.loading.set(true);
    this.ohsService.submitSafetyIncident(incident)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Incident submitted');
          this.loadData();
        },
        error: () => this.message.error('Failed to submit incident')
      });
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CATASTROPHIC': return 'red';
      case 'FATALITY': return 'orange';
      case 'MAJOR': return 'gold';
      case 'SERIOUS': return 'blue';
      case 'MODERATE': return 'cyan';
      default: return 'green'; // MINOR
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
