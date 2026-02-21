import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { JobVacancyService } from '../../services/job-vacancy.service';
import { JobVacancy, JobVacancyStatus, ApprovalStatus } from '../../models/job-vacancy.model';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-job-vacancy-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        NzTableModule,
        NzButtonModule,
        NzInputModule,
        NzSelectModule,
        NzTagModule,
        NzIconModule,
        NzDividerModule,
        NzPopconfirmModule,
        NzSpaceModule,
        NzSwitchModule,
        NzGridModule,
        NzTooltipModule
    ],
    templateUrl: './job-vacancy-list.component.html',
    styleUrls: ['./job-vacancy-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobVacancyListComponent implements OnInit {
    vacancies = signal<JobVacancy[]>([]);
    loading = signal<boolean>(false);

    // Filters
    statusFilter = signal<JobVacancyStatus | null>(null);
    ouFilter = signal<string | null>(null);
    internalOnly = signal<boolean>(false);

    statusOptions = Object.values(JobVacancyStatus);

    // Computed signal for filtered list
    filteredVacancies = computed(() => {
        let list = this.vacancies();
        const status = this.statusFilter();
        const ou = this.ouFilter();
        const internal = this.internalOnly();

        if (status) {
            list = list.filter(v => v.status === status);
        }

        if (ou) {
            list = list.filter(v => v.organisationalUnit.name.toLowerCase().includes(ou.toLowerCase()));
        }

        if (internal) {
            list = list.filter(v => v.internalOpportunity === true);
        }

        return list;
    });

    constructor(
        private jobVacancyService: JobVacancyService,
        private message: NzMessageService
    ) { }

    ngOnInit(): void {
        this.loadVacancies();
    }

    loadVacancies(): void {
        this.loading.set(true);
        this.jobVacancyService.getAll()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (data) => {
                    this.vacancies.set(data);
                    this.loading.set(false);
                },
                error: () => {
                    this.message.error('Failed to load job vacancies');
                    this.loading.set(false);
                }
            });
    }

    deleteVacancy(id: string): void {
        this.jobVacancyService.delete(id).subscribe({
            next: () => {
                this.message.success('Vacancy deleted successfully');
                this.vacancies.update(v => v.filter(item => item.id !== id));
            },
            error: () => this.message.error('Failed to delete vacancy')
        });
    }

    fulfillVacancy(id: string): void {
        this.jobVacancyService.fulfill(id).subscribe({
            next: () => {
                this.message.success('Vacancy marked as fulfilled');
                this.loadVacancies();
            },
            error: () => this.message.error('Failed to fulfill vacancy')
        });
    }

    getStatusColor(status: JobVacancyStatus): string {
        switch (status) {
            case JobVacancyStatus.PENDING: return 'gold';
            case JobVacancyStatus.APPROVED: return 'green';
            case JobVacancyStatus.DECLINED: return 'red';
            default: return 'default';
        }
    }
}
