import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LeaveManagementRequestService } from '../../../services/leave-request.service';
import { LeaveRequest } from '../../../models/leave-request.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-leave-request-detail',
    standalone: false,
    templateUrl: './request-detail.component.html',
    styleUrls: ['./request-detail.component.scss']
})
export class LeaveRequestDetailComponent implements OnInit {
    request = signal<LeaveRequest | null>(null);
    loading = signal<boolean>(false);
    actionLoading = signal<boolean>(false);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private requestService: LeaveManagementRequestService,
        private message: NzMessageService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.loadRequest(+id);
        }
    }

    loadRequest(id: number): void {
        this.loading.set(true);
        this.requestService.getById(id)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (res) => this.request.set(res),
                error: () => this.message.error('Failed to load leave request')
            });
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'APPROVED': return 'green';
            case 'REJECTED': return 'red';
            case 'PENDING': return 'blue';
            case 'SUBMITTED': return 'cyan';
            default: return 'gray';
        }
    }

    canApproveLM(): boolean {
        return this.request()?.status === 'SUBMITTED' && this.request()?.lineManagerApprovalStatus === 'PENDING';
    }

    canApproveHR(): boolean {
        return this.request()?.lineManagerApprovalStatus === 'APPROVED' && this.request()?.hrApprovalStatus === 'PENDING';
    }

    canReverse(): boolean {
        return this.request()?.status === 'APPROVED' && !this.request()?.reversedBy;
    }

    approveLM(): void {
        this.actionLoading.set(true);
        this.requestService.lineManagerApprove(this.request()!.id!)
            .pipe(finalize(() => this.actionLoading.set(false)))
            .subscribe({
                next: () => {
                    this.message.success('Request approved by Line Manager');
                    this.loadRequest(this.request()!.id!);
                },
                error: () => this.message.error('Approval failed')
            });
    }

    rejectLM(): void {
        const comments = prompt('Please enter rejection reason:');
        if (comments === null) return;

        this.actionLoading.set(true);
        this.requestService.lineManagerReject(this.request()!.id!, comments)
            .pipe(finalize(() => this.actionLoading.set(false)))
            .subscribe({
                next: () => {
                    this.message.success('Request rejected by Line Manager');
                    this.loadRequest(this.request()!.id!);
                },
                error: () => this.message.error('Rejection failed')
            });
    }

    approveHR(): void {
        this.actionLoading.set(true);
        this.requestService.hrApprove(this.request()!.id!)
            .pipe(finalize(() => this.actionLoading.set(false)))
            .subscribe({
                next: () => {
                    this.message.success('Request approved by HR');
                    this.loadRequest(this.request()!.id!);
                },
                error: () => this.message.error('Approval failed')
            });
    }

    rejectHR(): void {
        const comments = prompt('Please enter rejection reason:');
        if (comments === null) return;

        this.actionLoading.set(true);
        this.requestService.hrReject(this.request()!.id!, comments)
            .pipe(finalize(() => this.actionLoading.set(false)))
            .subscribe({
                next: () => {
                    this.message.success('Request rejected by HR');
                    this.loadRequest(this.request()!.id!);
                },
                error: () => this.message.error('Rejection failed')
            });
    }

    reverse(): void {
        const comments = prompt('Please enter reversal reason:');
        if (comments === null) return;

        this.actionLoading.set(true);
        this.requestService.reverse(this.request()!.id!, comments)
            .pipe(finalize(() => this.actionLoading.set(false)))
            .subscribe({
                next: () => {
                    this.message.success('Request reversed successfully');
                    this.loadRequest(this.request()!.id!);
                },
                error: () => this.message.error('Reversal failed')
            });
    }
}
