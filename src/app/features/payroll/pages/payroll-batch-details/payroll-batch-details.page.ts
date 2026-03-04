import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PayrollDataService } from '../../services/payroll-data.service';
import { PayrollBatch, PayrollBatchItem, Page, PayrollDecisionRequest } from '../../models/payroll-batch.model';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-payroll-batch-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzPageHeaderModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzDescriptionsModule,
    NzSpaceModule,
    NzCardModule,
    NzDividerModule,
    NzModalModule,
    NzInputModule,
    NzFormModule,
    FormsModule
  ],
  template: `
    <div class="p-6">
      <div *ngIf="batch() as b">
        <nz-page-header (nzBack)="goBack()" nzBackIcon nzTitle="Batch Details #{{ b.id }}">
          <nz-page-header-subtitle>
            {{ b.payrollYear }} / {{ b.payrollMonth | number:'2.0' }} - 
            <nz-tag [nzColor]="getStatusColor(b.status)">{{ b.status }}</nz-tag>
          </nz-page-header-subtitle>
          <nz-page-header-extra>
            <nz-space *ngIf="b.status === 'PENDING' || b.status === 'DRAFT' || b.status === 'SUCCESS'">
              <button nz-button nzType="primary" (click)="openDecisionModal('APPROVE')" [nzLoading]="actionLoading()">Approve</button>
              <button nz-button nzType="primary" nzDanger (click)="openDecisionModal('REJECT')" [nzLoading]="actionLoading()">Reject</button>
            </nz-space>
          </nz-page-header-extra>
        </nz-page-header>

        <nz-card class="mb-6">
          <nz-descriptions nzTitle="Summary Information" [nzColumn]="2">
            <nz-descriptions-item nzTitle="Company ID">{{ b.companyId }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="File Name">{{ b.originalFileName }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Total Rows">{{ b.totalRows }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Valid Rows">{{ b.validRows }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Error Rows">{{ b.errorRows }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Uploaded At">{{ b.uploadedAt | date:'medium' }}</nz-descriptions-item>
          </nz-descriptions>
        </nz-card>

        <nz-card nzTitle="Staged Payroll Rows">
          <nz-table #itemTable 
            [nzData]="items()" 
            [nzLoading]="loading()"
            [nzFrontPagination]="false"
            [nzTotal]="totalElements()"
            [nzPageIndex]="pageIndex() + 1"
            [nzPageSize]="pageSize()"
            (nzPageIndexChange)="onPageIndexChange($event)">
            <thead>
              <tr>
                <th>Row</th>
                <th>Payroll No</th>
                <th>Emp No</th>
                <th>Basic Salary</th>
                <th>Allowances</th>
                <th>Overtime</th>
                <th>Status/Errors</th>
                <th *ngIf="batch()?.payrollRunId">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let data of itemTable.data">
                <td>{{ data.rowIndex }}</td>
                <td>{{ data.payrollNumber }}</td>
                <td>{{ data.employeeNumber }}</td>
                <td>{{ data.additionalData['Basic Salary'] | number:'1.2-2' }}</td>
                <td>
                  {{ (data.additionalData['Housing Allowance'] || 0) + 
                     (data.additionalData['Travel Allowance'] || 0) + 
                     (data.additionalData['Cell Allowance'] || 0) | number:'1.2-2' }}
                </td>
                <td>{{ data.additionalData['Overtime Amount'] | number:'1.2-2' }}</td>
                <td>
                  <nz-tag *ngIf="data.valid && (!data.rowErrors || data.rowErrors.length === 0)" nzColor="success">Valid</nz-tag>
                  <div *ngFor="let err of data.rowErrors">
                    <nz-tag nzColor="error" [style.margin-bottom]="'4px'">{{ err }}</nz-tag>
                  </div>
                </td>
                <td *ngIf="batch()?.payrollRunId">
                  <button nz-button nzType="link" (click)="viewPayslip(data)">
                    <span nz-icon nzType="file-text"></span> View Payslip
                  </button>
                </td>
              </tr>
            </tbody>
          </nz-table>
        </nz-card>
      </div>
    </div>

    <!-- Decision Modal -->
    <nz-modal
      [(nzVisible)]="isModalVisible"
      [nzTitle]="modalTitle"
      (nzOnCancel)="handleModalCancel()"
      (nzOnOk)="handleDecisionSubmit()"
      [nzOkLoading]="actionLoading()"
      [nzOkDanger]="modalType === 'REJECT'"
    >
      <ng-container *nzModalContent>
        <p>Please provide a comment for this decision:</p>
        <textarea nz-input [(ngModel)]="decisionComment" placeholder="Enter comment..." [nzAutosize]="{ minRows: 3, maxRows: 6 }"></textarea>
      </ng-container>
    </nz-modal>
  `
})
export class PayrollBatchDetailsPage implements OnInit {
  batch = signal<PayrollBatch | null>(null);
  items = signal<PayrollBatchItem[]>([]);
  loading = signal<boolean>(false);
  actionLoading = signal<boolean>(false);

  pageIndex = signal<number>(0);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);

  // Modal state
  isModalVisible = false;
  modalTitle = '';
  modalType: 'APPROVE' | 'REJECT' = 'APPROVE';
  decisionComment = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private payrollDataService: PayrollDataService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadBatch(id);
      this.loadItems(id);
    }
  }

  viewPayslip(item: PayrollBatchItem): void {
    const runId = this.batch()?.payrollRunId;
    if (runId) {
      this.router.navigate(['/app/payroll/view-payslip', runId, item.employeeId]);
    }
  }

  loadBatch(id: number): void {
    this.payrollDataService.getById(id).subscribe({
      next: (res) => this.batch.set(res),
      error: () => this.message.error('Failed to load batch details.')
    });
  }

  loadItems(id: number): void {
    this.loading.set(true);
    this.payrollDataService.getItems(id, this.pageIndex(), this.pageSize())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res: Page<PayrollBatchItem>) => {
          this.items.set(res.content);
          this.totalElements.set(res.totalElements);
        },
        error: () => this.message.error('Failed to load batch items.')
      });
  }

  onPageIndexChange(index: number): void {
    this.pageIndex.set(index - 1);
    const id = this.batch()?.id;
    if (id) {
      this.loadItems(id);
    }
  }

  openDecisionModal(type: 'APPROVE' | 'REJECT'): void {
    this.modalType = type;
    this.modalTitle = type === 'APPROVE' ? 'Approve Payroll Batch' : 'Reject Payroll Batch';
    this.decisionComment = '';
    this.isModalVisible = true;
  }

  handleDecisionSubmit(): void {
    const id = this.batch()?.id;
    if (!id) return;

    if (!this.decisionComment.trim()) {
      this.message.warning('Please enter a comment.');
      return;
    }

    const request: PayrollDecisionRequest = {
      comment: this.decisionComment
    };

    this.actionLoading.set(true);
    const apiCall = this.modalType === 'APPROVE'
      ? this.payrollDataService.approve(id, request)
      : this.payrollDataService.reject(id, request);

    apiCall.pipe(finalize(() => {
      this.actionLoading.set(false);
      this.isModalVisible = false;
    })).subscribe({
      next: () => {
        this.message.success(`Batch ${this.modalType === 'APPROVE' ? 'approved' : 'rejected'} successfully.`);
        this.loadBatch(id);
      },
      error: () => this.message.error(`Failed to ${this.modalType.toLowerCase()} batch.`)
    });
  }

  handleModalCancel(): void {
    this.isModalVisible = false;
  }

  approve(): void {
    // Legacy - replaced by openDecisionModal
  }

  reject(): void {
    // Legacy - replaced by openDecisionModal
  }

  goBack(): void {
    window.history.back();
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
