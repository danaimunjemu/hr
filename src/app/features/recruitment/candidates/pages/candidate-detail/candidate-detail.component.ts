import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AntDesignModules } from '../../../../../core/modules/antdesign.module';
import { CandidateService } from '../../services/candidate.service';
import { Candidate, CandidateStatus } from '../../models/candidate.model';
import { finalize } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
    selector: 'app-candidate-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, AntDesignModules],
    templateUrl: './candidate-detail.component.html',
    styleUrls: ['./candidate-detail.component.scss'],
    providers: [DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateDetailComponent implements OnInit {
    candidate = signal<Candidate | null>(null);
    loading = signal<boolean>(false);

    // Job Offer Modal State
    isOfferModalVisible = signal<boolean>(false);
    isSubmittingOffer = signal<boolean>(false);
    offerForm: FormGroup;

    private datePipe = inject(DatePipe);

    constructor(
        public candidateService: CandidateService,
        public message: NzMessageService,
        public route: ActivatedRoute,
        public router: Router,
        private fb: FormBuilder
    ) {
        this.offerForm = this.fb.group({
            offeredSalary: [null, [Validators.required, Validators.min(0)]],
            offerDate: [null, [Validators.required]],
            expiryDate: [null, [Validators.required]]
        });
    }

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

    openOfferModal(): void {
        this.offerForm.reset();

        // Default offer date to today
        this.offerForm.patchValue({ offerDate: new Date() });
        this.isOfferModalVisible.set(true);
    }

    closeOfferModal(): void {
        this.isOfferModalVisible.set(false);
    }

    submitOffer(): void {
        if (this.offerForm.invalid) {
            Object.values(this.offerForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
            return;
        }

        const candidate = this.candidate();
        if (!candidate || !candidate.jobVacancy || !candidate.jobVacancy.id) {
            this.message.error('Candidate does not have a linked vacancy. Cannot assign offer.');
            return;
        }

        const formValues = this.offerForm.value;
        const payload = {
            candidateIds: [Number(candidate.id)],
            vacancyId: Number(candidate.jobVacancy.id),
            offeredSalary: formValues.offeredSalary,
            offerDate: this.datePipe.transform(formValues.offerDate, 'yyyy-MM-dd')!,
            expiryDate: this.datePipe.transform(formValues.expiryDate, 'yyyy-MM-dd')!
        };

        this.isSubmittingOffer.set(true);
        this.candidateService.assignJobOffer(payload)
            .pipe(finalize(() => this.isSubmittingOffer.set(false)))
            .subscribe({
                next: () => {
                    this.message.success('Job offer successfully assigned!');
                    this.closeOfferModal();
                    this.loadCandidate(candidate.id.toString()); // reload to reflect any state changes
                },
                error: (err) => {
                    console.error('Job offer assignment failed', err);
                    this.message.error('Failed to assign job offer. Please try again.');
                }
            });
    }
}
