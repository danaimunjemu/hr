import { Component, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { OhsService } from '../../services/ohs.service';
import { CorrectiveAction } from '../../models/ohs.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-corrective-action-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Corrective Actions</h1>
      <button nz-button nzType="primary" routerLink="create">New Action</button>
    </div>

    <nz-table #table [nzData]="actions()" [nzLoading]="loading()">
      <thead>
        <tr>
          <th>Description</th>
          <th>Assigned To</th>
          <th>Due Date</th>
          <th>Status</th>
          <th>Verified</th>
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
            <span *ngIf="data.verified" nz-icon nzType="check-circle" nzTheme="twotone" nzTwotoneColor="#52c41a"></span>
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
  actions = signal<CorrectiveAction[]>([]);
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
    this.ohsService.getCorrectiveActions()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.actions.set(data);
          this.cdr.markForCheck();
        },
        error: () => {
          this.message.error('Failed to load actions');
        }
      });
  }

  delete(id: string) {
    this.loading.set(true);
    this.ohsService.deleteCorrectiveAction(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Action deleted');
          this.loadData();
        },
        error: () => this.message.error('Failed to delete action')
      });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'VERIFIED': return 'green';
      case 'CLOSED': return 'gray';
      case 'IN_PROGRESS': return 'blue';
      case 'PENDING_VERIFICATION': return 'orange';
      default: return 'default';
    }
  }
}
