import { Component, OnInit } from '@angular/core';
import { ErCaseService } from '../../services/er-case.service';
import { ErCase } from '../../models/er-case.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-case-list',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold">Employee Relations Cases</h1>
      <button nz-button nzType="primary" routerLink="create">
        <span nz-icon nzType="plus"></span> Create Case
      </button>
    </div>

    <nz-card>
      <nz-table #basicTable [nzData]="cases" [nzLoading]="loading">
        <thead>
          <tr>
            <th>Case Number</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assigned To</th>
            <th>Created On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data">
            <td><a [routerLink]="['view', data.id]">{{ data.caseNumber }}</a></td>
            <td>{{ data.title }}</td>
            <td><nz-tag [nzColor]="getStatusColor(data.status)">{{ data.status }}</nz-tag></td>
            <td><nz-tag [nzColor]="getPriorityColor(data.priority)">{{ data.priority }}</nz-tag></td>
            <td>{{ data.assignedToUser?.firstName }} {{ data.assignedToUser?.lastName }}</td>
            <td>{{ data.createdOn | date }}</td>
            <td>
              <a [routerLink]="['view', data.id]">View</a>
              <nz-divider nzType="vertical"></nz-divider>
              <a [routerLink]="['edit', data.id]">Edit</a>
              <nz-divider nzType="vertical"></nz-divider>
              <a nz-popconfirm nzPopconfirmTitle="Delete this case?" (nzOnConfirm)="deleteCase(data.id)" class="text-red-500">Delete</a>
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
export class CaseListComponent implements OnInit {
  cases: ErCase[] = [];
  loading = true;

  constructor(
    private caseService: ErCaseService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    this.loading = true;
    this.caseService.getCases().subscribe({
      next: (data) => {
        this.cases = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load cases');
        this.loading = false;
      }
    });
  }

  deleteCase(id: number): void {
    this.caseService.deleteCase(id).subscribe({
      next: () => {
        this.message.success('Case deleted');
        this.loadCases();
      },
      error: () => this.message.error('Failed to delete case')
    });
  }

  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'OPEN': return 'blue';
      case 'CLOSED': return 'green';
      case 'TRIAGE': return 'gold';
      case 'IN_PROGRESS': return 'geekblue';
      default: return 'default';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'orange';
      case 'LOW': return 'green';
      default: return 'default';
    }
  }
}
