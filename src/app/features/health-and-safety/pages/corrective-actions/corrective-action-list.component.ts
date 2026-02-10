import { Component, OnInit } from '@angular/core';
import { OhsService } from '../../services/ohs.service';
import { CorrectiveAction } from '../../models/ohs.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-corrective-action-list',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">Corrective Actions</h1>
      <button nz-button nzType="primary" routerLink="create">New Action</button>
    </div>

    <nz-table #table [nzData]="actions" [nzLoading]="loading">
      <thead>
        <tr>
          <th>Description</th>
          <th>Assigned To</th>
          <th>Due Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let data of table.data">
          <td>{{ data.description }}</td>
          <td>{{ data.assignedTo }}</td>
          <td>{{ data.dueDate | date }}</td>
          <td>
            <nz-tag [nzColor]="getStatusColor(data.status)">{{ data.status }}</nz-tag>
          </td>
          <td>
            <a [routerLink]="['edit', data.id]">Edit</a>
            <nz-divider nzType="vertical"></nz-divider>
            <a nz-popconfirm nzPopconfirmTitle="Delete this action?" (nzOnConfirm)="delete(data.id)">Delete</a>
          </td>
        </tr>
      </tbody>
    </nz-table>
  `
})
export class CorrectiveActionListComponent implements OnInit {
  actions: CorrectiveAction[] = [];
  loading = false;

  constructor(private ohsService: OhsService, private message: NzMessageService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.ohsService.getCorrectiveActions().subscribe({
      next: (data) => {
        this.actions = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load actions');
        this.loading = false;
      }
    });
  }

  delete(id: string) {
    this.ohsService.deleteCorrectiveAction(id).subscribe({
      next: () => {
        this.message.success('Action deleted');
        this.loadData();
      },
      error: () => this.message.error('Failed to delete action')
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CLOSED': return 'green';
      case 'IN_PROGRESS': return 'blue';
      default: return 'orange';
    }
  }
}
