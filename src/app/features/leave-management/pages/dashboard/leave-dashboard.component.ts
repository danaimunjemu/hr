import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Chart } from '@antv/g2';
import { finalize } from 'rxjs';
import { LeaveManagementRequestService } from '../../services/leave-request.service';
import { LeaveManagementBalanceService } from '../../services/leave-balance.service';
import { LeaveManagementTypeService } from '../../services/leave-type.service';
import { LeaveRequest } from '../../models/leave-request.model';
import { LeaveBalance } from '../../models/leave-balance.model';
import { LeaveType } from '../../models/leave-type.model';

@Component({
    selector: 'app-leave-dashboard',
    templateUrl: './leave-dashboard.component.html',
    styleUrls: ['./leave-dashboard.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        NzSelectModule,
        NzGridModule,
        NzCardModule,
        NzStatisticModule,
        NzSpinModule,
        NzButtonModule,
        NzIconModule,
        NzTableModule,
        NzTagModule
    ]
})
export class LeaveDashboardComponent implements OnInit {
    loading = signal<boolean>(true);

    leaveTypes = signal<LeaveType[]>([]);
    selectedLeaveTypeId = signal<number | null>(null);

    // Stats Signals
    totalEntitlement = signal<number>(0);
    takenDays = signal<number>(0);
    pendingDays = signal<number>(0);
    availableDays = signal<number>(0);

    recentRequests = signal<LeaveRequest[]>([]);

    @ViewChild('consumptionChart') consumptionChartContainer!: ElementRef;
    @ViewChild('distributionChart') distributionChartContainer!: ElementRef;

    constructor(
        private requestService: LeaveManagementRequestService,
        private balanceService: LeaveManagementBalanceService,
        private typeService: LeaveManagementTypeService
    ) {
        effect(() => {
            if (!this.loading()) {
                setTimeout(() => {
                    this.renderConsumptionChart();
                    this.renderDistributionChart();
                }, 100);
            }
        });
    }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    private loadDashboardData(): void {
        this.loading.set(true);

        this.typeService.getAll().subscribe({
            next: (types: LeaveType[]) => {
                this.leaveTypes.set(types);
                if (types.length > 0) {
                    const firstId = types[0].id;
                    if (firstId !== undefined) {
                        this.selectedLeaveTypeId.set(firstId);
                        this.loadBalancesForType(firstId);
                    } else {
                        this.loading.set(false);
                    }
                } else {
                    this.loading.set(false);
                }
            },
            error: () => this.loading.set(false)
        });

        // Load Recent Requests
        this.requestService.getAll().subscribe({
            next: (requests: LeaveRequest[]) => {
                this.recentRequests.set(requests.slice(0, 5));
            }
        });
    }

    onLeaveTypeChange(id: number | null): void {
        this.selectedLeaveTypeId.set(id);
        if (id !== null) {
            this.loadBalancesForType(id);
        }
    }

    private loadBalancesForType(leaveTypeId: number | null): void {
        if (leaveTypeId === null) return;
        this.loading.set(true);
        this.balanceService.getReportBalances(leaveTypeId).pipe(
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: (balances: any[]) => {
                if (balances && balances.length > 0) {
                    const stats = balances[0];
                    this.totalEntitlement.set(stats.entitlement || 0);
                    this.takenDays.set(stats.taken || 0);
                    this.pendingDays.set(stats.pending || 0);
                    this.availableDays.set(stats.availableBalance || 0);
                } else {
                    this.totalEntitlement.set(0);
                    this.takenDays.set(0);
                    this.pendingDays.set(0);
                    this.availableDays.set(0);
                }
            },
            error: () => {
                this.totalEntitlement.set(0);
                this.takenDays.set(0);
                this.pendingDays.set(0);
                this.availableDays.set(0);
            }
        });
    }

    private renderConsumptionChart(): void {
        if (!this.consumptionChartContainer) return;
        this.consumptionChartContainer.nativeElement.innerHTML = '';

        const requests = this.recentRequests();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Group by month
        const monthlyData = requests.reduce((acc: any, req) => {
            const date = new Date(req.startDate);
            const month = monthNames[date.getMonth()];
            acc[month] = (acc[month] || 0) + (req.totalDays || 0);
            return acc;
        }, {});

        const data = monthNames.filter(m => monthlyData[m] !== undefined).map(month => ({
            month,
            value: monthlyData[month]
        }));

        if (data.length === 0) {
            data.push({ month: monthNames[new Date().getMonth()], value: 0 });
        }

        const chart = new Chart({
            container: this.consumptionChartContainer.nativeElement,
            autoFit: true,
            height: 300,
        });

        chart.data(data);
        chart.line().encode('x', 'month').encode('y', 'value').style('lineWidth', 2).style('stroke', '#1890ff');
        chart.point().encode('x', 'month').encode('y', 'value').style('fill', '#1890ff');
        chart.render();
    }

    private renderDistributionChart(): void {
        if (!this.distributionChartContainer) return;
        this.distributionChartContainer.nativeElement.innerHTML = '';

        const requests = this.recentRequests();
        const distribution: any = {};

        requests.forEach(req => {
            const typeName = req.leaveType?.name || 'Other';
            distribution[typeName] = (distribution[typeName] || 0) + 1;
        });

        const data = Object.keys(distribution).map(key => ({
            type: key,
            value: distribution[key]
        }));

        if (data.length === 0) {
            data.push({ type: 'None', value: 0 });
        }

        const chart = new Chart({
            container: this.distributionChartContainer.nativeElement,
            autoFit: true,
            height: 300,
        });

        chart.coordinate({ type: 'theta', innerRadius: 0.6 });
        chart.data(data);
        chart.interval()
            .transform({ type: 'stackY' })
            .encode('y', 'value')
            .encode('color', 'type')
            .label({ text: 'value', style: { fontWeight: 'bold' } });
        chart.render();
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
}
