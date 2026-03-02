import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../services/analytics.service';
import { PayrollService } from '../../services/payroll.service';
import { PayrollSummaryCardsComponent } from '../../components/payroll-summary-cards/payroll-summary-cards.component';
import { AnalyticsChartsComponent } from '../../components/analytics-charts/analytics-charts.component';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-payroll-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PayrollSummaryCardsComponent,
    AnalyticsChartsComponent,
    NzPageHeaderModule,
    NzSelectModule,
    NzSpinModule
  ],
  template: `
    <div class="p-6">
      <nz-page-header nzTitle="Payroll Analytics Dashboard">
        <nz-page-header-extra>
          <nz-select [(ngModel)]="selectedPeriod" (ngModelChange)="loadData()" style="width: 150px">
            <nz-option nzValue="2026-02" nzLabel="February 2026"></nz-option>
            <nz-option nzValue="2026-01" nzLabel="January 2026"></nz-option>
          </nz-select>
        </nz-page-header-extra>
      </nz-page-header>

      <div *ngIf="loading" class="flex justify-center p-12">
        <nz-spin nzSimple></nz-spin>
      </div>

      <div *ngIf="!loading">
        <app-payroll-summary-cards [metrics]="metrics"></app-payroll-summary-cards>
        
        <div class="mt-6">
          <app-analytics-charts 
            [deptData]="deptBreakdown" 
            [roleData]="roleDistribution">
          </app-analytics-charts>
        </div>
      </div>
    </div>
  `
})
export class PayrollAnalyticsPage implements OnInit {
  selectedPeriod: string = '2026-02';
  loading: boolean = true;
  metrics: any = {};
  deptBreakdown: any[] = [];
  roleDistribution: any[] = [];

  constructor(
    private analyticsService: AnalyticsService,
    private payrollService: PayrollService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.analyticsService.getSummaryMetrics().subscribe(m => {
      this.metrics = m;
      this.analyticsService.getDepartmentBreakdown().subscribe(db => {
        this.deptBreakdown = db;
        this.analyticsService.getRoleDistribution().subscribe(rd => {
          this.roleDistribution = rd;
          this.loading = false;
        });
      });
    });
  }
}
