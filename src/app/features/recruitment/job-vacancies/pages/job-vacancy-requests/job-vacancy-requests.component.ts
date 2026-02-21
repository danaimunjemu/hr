import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { JobVacancyService } from '../../services/job-vacancy.service';
import { JobVacancy, JobVacancyStatus, ApprovalStatus } from '../../models/job-vacancy.model';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-job-vacancy-requests',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NzTabsModule,
        NzTableModule,
        NzTagModule,
        NzSpinModule,
        NzButtonModule,
        NzIconModule,
        NzGridModule,
        NzCardModule,
        NzSpaceModule,
        NzTooltipModule
    ],
    templateUrl: './job-vacancy-requests.component.html',
    styleUrls: ['./job-vacancy-requests.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobVacancyRequestsComponent implements OnInit {
    requests = signal<JobVacancy[]>([]);
    loading = signal<boolean>(false);
    activeTabIndex = signal<number>(0);

    constructor(private jobVacancyService: JobVacancyService) { }

    ngOnInit(): void {
        this.loadAllRequests();
    }

    onTabChange(index: number): void {
        this.activeTabIndex.set(index);
        switch (index) {
            case 0: this.loadAllRequests(); break;
            case 1: this.loadRequestsByStatus(JobVacancyStatus.APPROVED); break;
            case 2: this.loadRequestsByHrApproval(ApprovalStatus.PENDING); break;
            case 3: this.loadRequestsByHodApproval(ApprovalStatus.PENDING); break;
            case 4: this.loadActiveInternal(); break;
        }
    }

    loadAllRequests(): void {
        this.loading.set(true);
        this.jobVacancyService.getRequests()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe(data => this.requests.set(data));
    }

    loadRequestsByStatus(status: JobVacancyStatus): void {
        this.loading.set(true);
        this.jobVacancyService.getRequestsByStatus(status)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe(data => this.requests.set(data));
    }

    loadRequestsByHrApproval(status: ApprovalStatus): void {
        this.loading.set(true);
        this.jobVacancyService.getRequestsByHrApproval(status)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe(data => this.requests.set(data));
    }

    loadRequestsByHodApproval(status: ApprovalStatus): void {
        this.loading.set(true);
        this.jobVacancyService.getRequestsByHodApproval(status)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe(data => this.requests.set(data));
    }

    loadActiveInternal(): void {
        this.loading.set(true);
        this.jobVacancyService.getActiveInternal()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe(data => this.requests.set(data));
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
}
