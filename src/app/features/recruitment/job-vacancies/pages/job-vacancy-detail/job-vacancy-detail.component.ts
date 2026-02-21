import { Component, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { JobVacancyService } from '../../services/job-vacancy.service';
import { JobVacancy, JobVacancyStatus, ApprovalStatus, ApprovalRequestPayload } from '../../models/job-vacancy.model';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-job-vacancy-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NzCardModule,
        NzDescriptionsModule,
        NzTagModule,
        NzButtonModule,
        NzIconModule,
        NzDividerModule,
        NzModalModule,
        NzSpinModule,
        NzSpaceModule,
        NzGridModule,
        NzTimelineModule,
        NzAlertModule,
        NzTooltipModule,
        NzRadioModule,
        NzInputModule,
        FormsModule
    ],
    templateUrl: './job-vacancy-detail.component.html',
    styleUrls: ['./job-vacancy-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobVacancyDetailComponent implements OnInit {
    vacancy = signal<JobVacancy | null>(null);
    loading = signal<boolean>(true);

    // Mock current user role
    currentUser = { role: 'ADMIN', id: 'E001' };

    constructor(
        private route: ActivatedRoute,
        private jobVacancyService: JobVacancyService,
        private message: NzMessageService,
        private modal: NzModalService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadVacancy(id);
        }
    }

    loadVacancy(id: string): void {
        this.loading.set(true);
        this.jobVacancyService.getById(id)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (data) => this.vacancy.set(data),
                error: () => this.message.error('Failed to load job vacancy details')
            });
    }

    approveHr(): void {
        this.openApprovalModal('HR');
    }

    approveHod(): void {
        this.openApprovalModal('HOD');
    }

    private openApprovalModal(type: 'HR' | 'HOD'): void {
        const vacancyId = this.vacancy()?.id;
        if (!vacancyId) return;

        let comment = '';
        let decision = ApprovalStatus.APPROVE;

        this.modal.create({
            nzTitle: `${type} Approval Decision`,
            nzContent: `
                <div class="approval-modal-content">
                    <p>Select your decision and provide a comment for this vacancy request.</p>
                    <div class="mb-4 mt-2">
                        <label class="block mb-2 font-semibold">Decision:</label>
                        <nz-radio-group [(ngModel)]="decision">
                            <label nz-radio nzValue="APPROVE">Approve</label>
                            <label nz-radio nzValue="DECLINE">Decline</label>
                        </nz-radio-group>
                    </div>
                    <div>
                        <label class="block mb-2 font-semibold">Comment:</label>
                        <textarea nz-input [(ngModel)]="comment" rows="4" placeholder="Enter your comments here..."></textarea>
                    </div>
                </div>
            `,
            nzMaskClosable: true,
            nzOnOk: () => {
                const payload: ApprovalRequestPayload = { decision, comment: comment || (decision === ApprovalStatus.APPROVE ? 'Approved' : 'Declined') };
                const action = type === 'HR'
                    ? this.jobVacancyService.approveHr(vacancyId, payload)
                    : this.jobVacancyService.approveHod(vacancyId, payload);

                action.subscribe({
                    next: () => {
                        this.message.success(`${type} decision submitted successfully`);
                        this.loadVacancy(vacancyId);
                    },
                    error: () => this.message.error(`Failed to submit ${type} decision`)
                });
            }
        });
    }

    fulfill(): void {
        const vacancyId = this.vacancy()?.id;
        if (!vacancyId) return;

        this.jobVacancyService.fulfill(vacancyId).subscribe({
            next: () => {
                this.message.success('Vacancy fulfilled');
                this.loadVacancy(vacancyId);
            },
            error: () => this.message.error('Failed to fulfill vacancy')
        });
    }

    getStatusColor(status: any): string {
        switch (status) {
            case JobVacancyStatus.PENDING:
            case ApprovalStatus.PENDING:
                return 'gold';
            case JobVacancyStatus.APPROVED:
            case ApprovalStatus.APPROVE:
                return 'green';
            case JobVacancyStatus.DECLINED:
            case ApprovalStatus.DECLINE:
                return 'red';
            default: return 'default';
        }
    }

    // Workflow Logic (Computed Signals)
    canApproveHod = computed(() => {
        const v = this.vacancy();
        return !!(v && v.headOfDepartmentApprovalStatus === ApprovalStatus.PENDING);
    });

    canApproveHr = computed(() => {
        const v = this.vacancy();
        return !!(v && v.hrManagerApprovalStatus === ApprovalStatus.PENDING);
    });

    canFulfill = computed(() => {
        const v = this.vacancy();
        return !!(v && v.status === JobVacancyStatus.APPROVED &&
            v.headOfDepartmentApprovalStatus === ApprovalStatus.APPROVE &&
            v.hrManagerApprovalStatus === ApprovalStatus.APPROVE &&
            v.positionsFilled < v.numberOfPositions);
    });
}
