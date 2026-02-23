import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AntDesignModules } from '../../../../../core/modules/antdesign.module';
import { CandidateService } from '../../services/candidate.service';
import { Candidate, CandidateStatus } from '../../models/candidate.model';
import { finalize } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
    selector: 'app-candidate-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, AntDesignModules],
    templateUrl: './candidate-list.component.html',
    styleUrls: ['./candidate-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateListComponent implements OnInit {
    candidates = signal<Candidate[]>([]);
    loading = signal<boolean>(false);

    // Filters
    searchQuery = signal<string>('');
    statusFilter = signal<CandidateStatus | 'ALL'>('ALL');

    // Stats
    stats = computed(() => {
        const all = this.candidates();
        return {
            total: all.length,
            new: all.filter(c => c.status === 'New').length,
            interviewing: all.filter(c => c.status === 'Interview').length,
            hired: all.filter(c => c.status === 'Hired').length
        };
    });

    filteredCandidates = computed(() => {
        let list = this.candidates();
        const query = this.searchQuery().toLowerCase();
        const status = this.statusFilter();

        if (query) {
            list = list.filter(c =>
                c.firstName.toLowerCase().includes(query) ||
                c.lastName.toLowerCase().includes(query) ||
                c.email.toLowerCase().includes(query)
            );
        }

        if (status !== 'ALL') {
            list = list.filter(c => c.status === status);
        }

        return list;
    });

    constructor(
        private candidateService: CandidateService,
        private message: NzMessageService
    ) { }

    ngOnInit(): void {
        this.loadCandidates();
    }

    loadCandidates(): void {
        this.loading.set(true);
        this.candidateService.getAll()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (data) => this.candidates.set(data),
                error: () => this.message.error('Failed to load candidates')
            });
    }

    getStatusColor(status: CandidateStatus): string {
        switch (status) {
            case 'New': return 'blue';
            case 'Review': return 'orange';
            case 'Interview': return 'purple';
            case 'Offer': return 'green';
            case 'Rejected': return 'red';
            case 'Hired': return 'geekblue';
            default: return 'default';
        }
    }

    deleteCandidate(id: number): void {
        this.candidateService.delete(id.toString()).subscribe({
            next: () => {
                this.message.success('Candidate deleted successfully');
                this.loadCandidates();
            },
            error: () => this.message.error('Failed to delete candidate')
        });
    }
}
