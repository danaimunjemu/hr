import { Component, OnInit } from '@angular/core';
import { OhsService } from '../../services/ohs.service';
import { Induction } from '../../models/ohs.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-induction-list',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">Inductions</h1>
      <button nz-button nzType="primary" routerLink="create">New Induction</button>
    </div>

    <nz-table #table [nzData]="inductions" [nzLoading]="loading">
      <thead>
        <tr>
          <th>Title</th>
          <th>Valid From</th>
          <th>Valid Until</th>
          <th>Required Roles</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let data of table.data">
          <td>{{ data.title }}</td>
          <td>{{ data.validFrom | date }}</td>
          <td>{{ data.validUntil | date }}</td>
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
  inductions: Induction[] = [];
  loading = false;

  constructor(private ohsService: OhsService, private message: NzMessageService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.ohsService.getInductions().subscribe({
      next: (data) => {
        this.inductions = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load inductions');
        this.loading = false;
      }
    });
  }

  delete(id: string) {
    this.ohsService.deleteInduction(id).subscribe({
      next: () => {
        this.message.success('Induction deleted');
        this.loadData();
      },
      error: () => this.message.error('Failed to delete induction')
    });
  }
}
