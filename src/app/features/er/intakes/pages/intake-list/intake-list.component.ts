import { Component, OnInit } from '@angular/core';
import { ErIntakeService } from '../../services/er-intake.service';
import { ErIntake } from '../../models/er-intake.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-intake-list',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold">Case Intakes</h1>
      <button nz-button nzType="primary" routerLink="create">
        <span nz-icon nzType="plus"></span> New Intake
      </button>
    </div>

    <nz-card>
      <nz-table #basicTable [nzData]="intakes" [nzLoading]="loading">
        <thead>
          <tr>
            <th>Case</th>
            <th>Incident Date</th>
            <th>Location</th>
            <th>Logged By</th>
            <th>Triage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data">
            <td>
              <a [routerLink]="['/er/cases/view', data.erCase.id]">
                {{ data.erCase.caseNumber || 'Case #' + data.erCase.id }}
              </a>
            </td>
            <td>{{ data.incidentDateFrom | date:'medium' }}</td>
            <td>{{ data.incidentLocation }}</td>
            <td>{{ data.loggedBy.firstName }} {{ data.loggedBy.lastName }}</td>
            <td>
              <nz-tag [nzColor]="getTriageColor(data.triageDecision)">{{ data.triageDecision || 'PENDING' }}</nz-tag>
            </td>
            <td>
              <a [routerLink]="['view', data.id]">View</a>
              <nz-divider nzType="vertical"></nz-divider>
              <a [routerLink]="['edit', data.id]">Triage</a>
              <nz-divider nzType="vertical"></nz-divider>
              <a nz-popconfirm nzPopconfirmTitle="Delete this intake?" (nzOnConfirm)="deleteIntake(data.id)" class="text-red-500">Delete</a>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
  `]
})
export class IntakeListComponent implements OnInit {
  intakes: ErIntake[] = [];
  loading = true;

  constructor(
    private intakeService: ErIntakeService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadIntakes();
  }

  loadIntakes(): void {
    this.loading = true;
    this.intakeService.getIntakes().subscribe({
      next: (data) => {
        this.intakes = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load intakes');
        this.loading = false;
      }
    });
  }

  deleteIntake(id: number): void {
    this.intakeService.deleteIntake(id).subscribe({
      next: () => {
        this.message.success('Intake deleted');
        this.loadIntakes();
      },
      error: () => this.message.error('Failed to delete intake')
    });
  }

  getTriageColor(decision?: string): string {
    switch (decision) {
      case 'PROCEED': return 'green';
      case 'INVESTIGATE': return 'blue';
      case 'MEDIATE': return 'orange';
      case 'DISMISS': return 'red';
      default: return 'default';
    }
  }
}
