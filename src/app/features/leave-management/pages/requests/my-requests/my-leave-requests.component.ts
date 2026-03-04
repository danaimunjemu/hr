import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { LeaveManagementRequestService } from '../../../services/leave-request.service';
import { LeaveRequest } from '../../../models/leave-request.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../authentication/services/auth';

@Component({
    selector: 'app-my-leave-requests',
    templateUrl: './my-leave-requests.component.html',
    styleUrls: ['./my-leave-requests.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NzTableModule,
        NzTagModule,
        NzButtonModule,
        NzIconModule,
        NzCardModule,
        NzEmptyModule
    ]
})
export class MyLeaveRequestsComponent implements OnInit {
    requests = signal<LeaveRequest[]>([]);
    loading = signal<boolean>(false);

    private requestService = inject(LeaveManagementRequestService);
    private message = inject(NzMessageService);
    private authService = inject(AuthService);

    ngOnInit(): void {
        this.loadMyRequests();
    }

    loadMyRequests(): void {
        this.loading.set(true);
        const currentUser = this.authService.currentUser();
        const employeeId = currentUser?.employee?.id;

        this.requestService.getAll()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (res: LeaveRequest[]) => {
                    if (employeeId) {
                        const filtered = res.filter(r => r.employee?.id === employeeId);
                        this.requests.set(filtered);
                    } else {
                        // If no employee ID found, maybe show all for now or empty
                        this.requests.set([]);
                        this.message.warning('Could not identify current employee to filter requests.');
                    }
                },
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

    getRiskColor(risk: string): string {
        switch (risk) {
            case 'HIGH': return 'error';
            case 'MEDIUM': return 'warning';
            case 'LOW': return 'success';
            default: return 'default';
        }
    }

    submitRequest(id: number): void {
        this.requestService.submit(id).subscribe({
            next: () => {
                this.message.success('Request submitted successfully');
                this.loadMyRequests();
            },
            error: () => this.message.error('Failed to submit request')
        });
    }
}
