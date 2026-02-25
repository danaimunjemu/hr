import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { LeaveManagementAllocationService } from '../../../services/allocation.service';
import { LeaveAllocationPolicy } from '../../../models/allocation-policy.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-allocation-config',
  templateUrl: './allocation-config.component.html',
  standalone: false
})
export class AllocationPolicyConfigComponent implements OnInit {
  // policies: LeaveAllocationPolicy[] = [];
  policies = signal<any[]>([]);
  loading = signal<boolean>(false);

  constructor(
    private allocationService: LeaveManagementAllocationService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.loading.set(true);
    this.allocationService.getPolicies()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res: LeaveAllocationPolicy[]) => this.policies.set(res),
        error: () => this.message.error('Failed to load allocation policies')
      });
  }

  togglePolicy(policy: LeaveAllocationPolicy): void {
    // Logic to toggle policy active state
    this.message.info('Toggle logic not yet implemented');
  }

  runAllocation(policyId: number): void {
    this.allocationService.executeRun({ policyId, cycleCode: '2026' }).subscribe({
      next: () => this.message.success('Allocation run started'),
      error: () => this.message.error('Failed to start allocation run')
    });
  }
}
