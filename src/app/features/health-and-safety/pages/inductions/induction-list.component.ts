import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { OhsService } from '../../services/ohs.service';
import { Induction } from '../../models/ohs.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-induction-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Inductions</h1>
      <button nz-button nzType="primary" routerLink="create">New Induction</button>
    </div>

    <nz-table #table [nzData]="inductions()" [nzLoading]="loading()">
      <thead>
        <tr>
          <th>Title</th>
          <th>Valid From</th>
          <th>Valid Until</th>
          <th>Status</th>
          <th>Required Roles</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let data of table.data">
          <td>{{ data.title }}</td>
          <td>{{ data.validFrom | date }}</td>
          <td>{{ data.validUntil | date }}</td>
          <td>
            <nz-tag [nzColor]="getStatusColor(data.status)">{{ data.status || 'SCHEDULED' }}</nz-tag>
          </td>
          <td>{{ data.requiredForRoles.join(', ') }}</td>
          <td>
            <a [routerLink]="['edit', data.id]">Edit</a>
            <nz-divider nzType="vertical"></nz-divider>
            <a nz-popconfirm nzPopconfirmTitle="Delete this induction?" (nzOnConfirm)="delete(data.id)">Delete</a>
          </td>
        </tr>
      </tbody>
    </nz-table>
  `
})
export class InductionListComponent implements OnInit {
  inductions = signal<Induction[]>([]);
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
    this.ohsService.getInductions()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.inductions.set(data);
        },
        error: () => {
          this.message.error('Failed to load inductions');
        }
      });
  }

  delete(id: string) {
    this.loading.set(true);
    this.ohsService.deleteInduction(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Induction deleted');
          this.loadData();
        },
        error: () => this.message.error('Failed to delete induction')
      });
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      case 'IN_PROGRESS': return 'processing';
      default: return 'blue';
    }
  }
}
