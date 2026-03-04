import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PayrollDataService } from '../../services/payroll-data.service';
import { PayrollBatch } from '../../models/payroll-batch.model';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-payroll-batch-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzPageHeaderModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule
  ],
  template: `
    <div class="p-6">
      <nz-page-header nzTitle="Payroll Data Batches">
        <nz-page-header-subtitle>Manage and approve uploaded payroll data</nz-page-header-subtitle>
        <nz-page-header-extra>
          <button nz-button nzType="primary" routerLink="../import">
            <span nz-icon nzType="upload"></span> Import New Batch
          </button>
        </nz-page-header-extra>
      </nz-page-header>

      <nz-table #batchTable 
        [nzData]="batches()" 
        [nzLoading]="loading()"
        [nzFrontPagination]="false"
        [nzTotal]="totalElements()"
        [nzPageIndex]="pageIndex() + 1"
        [nzPageSize]="pageSize()"
        (nzPageIndexChange)="onPageIndexChange($event)">
        <thead>
          <tr>
            <th>ID</th>
            <th>File Name</th>
            <th>Cycle (Year/Month)</th>
            <th>Rows (Total/Valid/Error)</th>
            <th>Status</th>
            <th>Uploaded On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of batchTable.data">
            <td>{{ data.id }}</td>
            <td>
              <span class="font-medium">{{ data.originalFileName }}</span>
              <div *ngIf="data.fileErrorMessage" class="text-red-500 text-xs">{{ data.fileErrorMessage }}</div>
            </td>
            <td>{{ data.payrollYear }} / {{ data.payrollMonth | number:'2.0' }}</td>
            <td>
              <nz-tag nzColor="blue">{{ data.totalRows }}</nz-tag>
              <nz-tag nzColor="green">{{ data.validRows }}</nz-tag>
              <nz-tag nzColor="red" *ngIf="data.errorRows > 0">{{ data.errorRows }}</nz-tag>
            </td>
            <td>
              <nz-tag [nzColor]="getStatusColor(data.status)">
                {{ data.status }}
              </nz-tag>
            </td>
            <td>{{ data.uploadedAt | date:'medium' }}</td>
            <td>
              <button nz-button nzType="link" [routerLink]="['../batch', data.id]">View Details</button>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </div>
  `
})
export class PayrollBatchListPage implements OnInit {
  batches = signal<PayrollBatch[]>([]);
  loading = signal<boolean>(false);

  totalElements = signal<number>(0);
  pageSize = signal<number>(10);
  pageIndex = signal<number>(0);

  constructor(
    private payrollDataService: PayrollDataService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadBatches();
  }

  loadBatches(): void {
    this.loading.set(true);
    this.payrollDataService.getAll(this.pageIndex(), this.pageSize())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.batches.set(res.content);
          this.totalElements.set(res.totalElements);
        },
        error: () => this.message.error('Failed to load payroll batches.')
      });
  }

  onPageIndexChange(index: number): void {
    this.pageIndex.set(index - 1);
    this.loadBatches();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED': case 'SUCCESS': return 'success';
      case 'REJECTED': case 'ERROR': return 'error';
      case 'PENDING': return 'processing';
      case 'DRAFT': return 'default';
      default: return 'default';
    }
  }
}
