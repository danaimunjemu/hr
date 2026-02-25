import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { LeaveManagementBalanceService } from '../../../services/leave-balance.service';
import { LeaveBalance } from '../../../models/leave-balance.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-balance-list',
    templateUrl: './balance-list.component.html',
    styleUrls: ['./balance-list.component.scss'],
    standalone: false
})
export class BalanceListComponent implements OnInit {
    balances = signal<LeaveBalance[]>([]);
    loading = signal<boolean>(false);

    constructor(
        private balanceService: LeaveManagementBalanceService,
        private message: NzMessageService
    ) { }

    ngOnInit(): void {
        this.loadBalances();
    }

    loadBalances(): void {
        this.loading.set(true);
        this.balanceService.getAll()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (res: LeaveBalance[]) => this.balances.set(res),
                error: () => this.message.error('Failed to load leave balances')
            });
    }

    getAvailableStyles(days: number): any {
        if (days > 10) return { color: '#3F8600' };
        if (days > 0) return { color: '#faad14' };
        return { color: '#cf1322' };
    }
}
