import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { LeaveManagementOffboardingService } from '../../../services/offboarding.service';
import { LeaveOffboardingPayoutRun } from '../../../models/offboarding-payout.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-offboarding-payout',
  templateUrl: './offboarding-payout.component.html',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule
  ]
})
export class OffboardingPayoutComponent implements OnInit {
  // payoutRuns: LeaveOffboardingPayoutRun[] = [];
  payoutRuns = signal<any[]>([]);
  loading = signal<boolean>(false);

  constructor(
    private offboardingService: LeaveManagementOffboardingService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadPayoutRuns();
  }

  loadPayoutRuns(): void {
    this.loading.set(true);
    this.offboardingService.getPayoutRuns()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res: LeaveOffboardingPayoutRun[]) => this.payoutRuns.set(res),
        error: () => this.message.error('Failed to load offboarding payouts')
      });
  }

  finalizeRun(id: number): void {
    this.offboardingService.finalizePayout(id).subscribe({
      next: () => {
        this.message.success('Payout finalized');
        this.loadPayoutRuns();
      },
      error: () => this.message.error('Failed to finalize payout')
    });
  }
}
