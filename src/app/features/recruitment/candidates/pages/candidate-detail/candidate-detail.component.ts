import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AntDesignModules } from '../../../../../core/modules/antdesign.module';
import { CandidateService } from '../../services/candidate.service';
import { Candidate, CandidateStatus } from '../../models/candidate.model';
import { finalize } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
    selector: 'app-candidate-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, AntDesignModules],
    templateUrl: './candidate-detail.component.html',
    styleUrls: ['./candidate-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateDetailComponent implements OnInit {
    candidate = signal<Candidate | null>(null);
    loading = signal<boolean>(false);

    constructor(
        public candidateService: CandidateService,
        public message: NzMessageService,
        public route: ActivatedRoute,
        public router: Router
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.loadCandidate(params['id']);
            }
        });
    }

    private loadCandidate(id: string): void {
        this.loading.set(true);
        this.candidateService.getById(id)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (data) => this.candidate.set(data),
                error: () => this.message.error('Failed to load candidate details')
            });
    }

    getStatusColor(status: CandidateStatus | undefined): string {
        if (!status) return 'default';
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

    updateStatus(newStatus: CandidateStatus): void {
        const current = this.candidate();
        if (!current) return;

        this.candidateService.update(current.id.toString(), { status: newStatus }).subscribe({
            next: () => {
                this.message.success(`Status updated to ${newStatus}`);
                this.loadCandidate(current.id.toString());
            },
            error: () => this.message.error('Failed to update status')
        });
    }
}
