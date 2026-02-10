import { Component, OnInit } from '@angular/core';
import { ErOutcomeService } from '../../services/er-outcome.service';
import { ErOutcome } from '../../models/er-outcome.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-outcome-list',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold">Case Outcomes</h1>
      <button nz-button nzType="primary" routerLink="create">
        <span nz-icon nzType="plus"></span> Record Outcome
      </button>
    </div>

    <nz-card>
      <nz-table #basicTable [nzData]="outcomes" [nzLoading]="loading">
        <thead>
          <tr>
            <th>Case</th>
            <th>Type</th>
            <th>Decided By</th>
            <th>Decision Date</th>
            <th>Communicated</th>
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
            <td><nz-tag [nzColor]="getOutcomeColor(data.outcomeType)">{{ data.outcomeType }}</nz-tag></td>
            <td>{{ data.decidedBy.firstName }} {{ data.decidedBy.lastName }}</td>
            <td>{{ data.decisionAt | date:'mediumDate' }}</td>
            <td>
              <nz-badge [nzStatus]="data.communicatedAt ? 'success' : 'default'" 
                        [nzText]="data.communicatedAt ? (data.communicatedAt | date:'short') : 'Pending'">
              </nz-badge>
            </td>
            <td>
              <a [routerLink]="['view', data.id]">View</a>
              <nz-divider nzType="vertical"></nz-divider>
              <a [routerLink]="['edit', data.id]">Update</a>
              <nz-divider nzType="vertical"></nz-divider>
              <a nz-popconfirm nzPopconfirmTitle="Delete this outcome?" (nzOnConfirm)="deleteOutcome(data.id)" class="text-red-500">Delete</a>
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
export class OutcomeListComponent implements OnInit {
  outcomes: ErOutcome[] = [];
  loading = true;

  constructor(
    private outcomeService: ErOutcomeService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadOutcomes();
  }

  loadOutcomes(): void {
    this.loading = true;
    this.outcomeService.getOutcomes().subscribe({
      next: (data) => {
        this.outcomes = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load outcomes');
        this.loading = false;
      }
    });
  }

  deleteOutcome(id: number): void {
    this.outcomeService.deleteOutcome(id).subscribe({
      next: () => {
        this.message.success('Outcome deleted');
        this.loadOutcomes();
      },
      error: () => this.message.error('Failed to delete outcome')
    });
  }

  getOutcomeColor(type: string): string {
    switch (type) {
      case 'DISMISSAL': return 'red';
      case 'WRITTEN_WARNING': return 'orange';
      case 'VERBAL_WARNING': return 'gold';
      case 'EXONERATED': return 'green';
      default: return 'default';
    }
  }
}
