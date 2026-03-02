import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-payroll-summary-cards',
  standalone: true,
  imports: [CommonModule, NzStatisticModule, NzCardModule, NzGridModule],
  template: `
    <div nz-row [nzGutter]="16">
      <div nz-col [nzSpan]="6">
        <nz-card>
          <nz-statistic
            [nzValue]="(metrics?.totalPayroll | number:'1.2-2')!"
            [nzTitle]="'Total Payroll'"
            [nzPrefix]="'R '"
            [nzValueStyle]="{ color: '#3f8600' }"
          ></nz-statistic>
        </nz-card>
      </div>
      <div nz-col [nzSpan]="6">
        <nz-card>
          <nz-statistic
            [nzValue]="(metrics?.totalOvertime | number:'1.2-2')!"
            [nzTitle]="'Total Overtime'"
            [nzPrefix]="'R '"
            [nzValueStyle]="{ color: '#1890ff' }"
          ></nz-statistic>
        </nz-card>
      </div>
      <div nz-col [nzSpan]="6">
        <nz-card>
          <nz-statistic
            [nzValue]="(metrics?.totalPaye | number:'1.2-2')!"
            [nzTitle]="'Total PAYE'"
            [nzPrefix]="'R '"
            [nzValueStyle]="{ color: '#cf1322' }"
          ></nz-statistic>
        </nz-card>
      </div>
      <div nz-col [nzSpan]="6">
        <nz-card>
          <nz-statistic
            [nzValue]="(metrics?.leavePayable | number:'1.2-2')!"
            [nzTitle]="'Leave Payable'"
            [nzPrefix]="'R '"
          ></nz-statistic>
        </nz-card>
      </div>
    </div>
  `
})
export class PayrollSummaryCardsComponent {
  @Input() metrics: any;
}
