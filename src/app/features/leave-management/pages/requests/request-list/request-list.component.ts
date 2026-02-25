import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { LeaveManagementRequestService } from '../../../services/leave-request.service';
import { LeaveRequest } from '../../../models/leave-request.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-request-list',
    templateUrl: './request-list.component.html',
    styleUrls: ['./request-list.component.scss'],
    standalone: false
})
export class RequestListComponent implements OnInit {
    requests = signal<LeaveRequest[]>([]);
    loading = signal<boolean>(false);

    constructor(
        private requestService: LeaveManagementRequestService,
        private message: NzMessageService
    ) { }

    ngOnInit(): void {
        this.loadRequests();
    }

    loadRequests(): void {
        this.loading.set(true);
        this.requestService.getAll()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (res: LeaveRequest[]) => this.requests.set(res),
                error: () => this.message.error('Failed to load leave requests')
            });
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            case 'PENDING_APPROVAL':
            case 'SUBMITTED': return 'processing';
            case 'CANCELLED':
            case 'WITHDRAWN': return 'default';
            default: return 'default';
        }
    }

    submitRequest(id: number): void {
        this.requestService.submit(id).subscribe({
            next: () => {
                this.message.success('Request submitted successfully');
                this.loadRequests();
            },
            error: () => this.message.error('Failed to submit request')
        });
    }
}
