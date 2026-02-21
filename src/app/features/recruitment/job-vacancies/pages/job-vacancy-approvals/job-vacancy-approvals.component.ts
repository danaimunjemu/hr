import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { JobVacancyService } from '../../services/job-vacancy.service';
import { JobVacancy, ApprovalStatus, ApprovalRequestPayload } from '../../models/job-vacancy.model';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-job-vacancy-approvals',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        NzTableModule,
        NzButtonModule,
        NzTagModule,
        NzModalModule,
        NzInputModule,
        NzFormModule,
        NzCardModule,
        NzRadioModule,
        NzSpaceModule,
        NzGridModule
    ],
    templateUrl: './job-vacancy-approvals.component.html',
    styleUrls: ['./job-vacancy-approvals.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobVacancyApprovalsComponent implements OnInit {
    pendingApprovals = signal<JobVacancy[]>([]);
    loading = signal<boolean>(false);
    role = signal<'HR' | 'HOD'>('HR');

    constructor(
        private jobVacancyService: JobVacancyService,
        private message: NzMessageService,
        private modal: NzModalService
    ) { }

    ngOnInit(): void {
        this.loadPendingApprovals();
    }

    loadPendingApprovals(): void {
        this.loading.set(true);
        const action = this.role() === 'HR'
            ? this.jobVacancyService.getRequestsByHrApproval(ApprovalStatus.PENDING)
            : this.jobVacancyService.getRequestsByHodApproval(ApprovalStatus.PENDING);

        action.pipe(finalize(() => this.loading.set(false)))
            .subscribe(data => this.pendingApprovals.set(data));
    }

    onRoleChange(): void {
        this.loadPendingApprovals();
    }

    handleApproval(vacancyId: string): void {
        let comment = '';
        let approvalStatus = ApprovalStatus.APPROVE;

        const modalRef = this.modal.create({
            nzTitle: `Handle Approval - ${this.role()}`,
            nzContent: `
        <div>
          <label>Decision:</label>
          <div class="mb-4 mt-2">
            <nz-radio-group [(ngModel)]="approvalStatus">
              <label nz-radio nzValue="APPROVE">Approve</label>
              <label nz-radio nzValue="DECLINE">Decline</label>
            </nz-radio-group>
          </div>
          <label>Comment:</label>
          <textarea nz-input [(ngModel)]="comment" rows="4" placeholder="Enter comments here..."></textarea>
        </div>
      `,
            nzOnOk: () => {
                const payload: ApprovalRequestPayload = { decision: approvalStatus, comment: comment || 'Actioned by user' };
                const action = this.role() === 'HR'
                    ? this.jobVacancyService.approveHr(vacancyId, payload)
                    : this.jobVacancyService.approveHod(vacancyId, payload);

                action.subscribe({
                    next: () => {
                        this.message.success('Approval processed successfully');
                        this.loadPendingApprovals();
                    },
                    error: () => this.message.error('Failed to process approval')
                });
            }
        });
    }
}
