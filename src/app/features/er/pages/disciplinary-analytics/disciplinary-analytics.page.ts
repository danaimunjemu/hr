import { Component, OnInit, signal } from '@angular/core';
import { ErAnalyticsService, DisciplinaryDashboard } from '../../services/er-analytics.service';

@Component({
  selector: 'app-disciplinary-analytics',
  standalone: false,
  template: `
    <div class="p-6">
      <nz-page-header nzTitle="Disciplinary Analytics">
        <nz-page-header-extra>
          <nz-range-picker></nz-range-picker>
          <button nz-button nzType="primary" class="ml-2">Export</button>
        </nz-page-header-extra>
      </nz-page-header>

      <div *ngIf="dashboard() as data">
        <app-disciplinary-summary-cards 
          [summary]="{
            totalCases: data.totalCases,
            activeWarnings: data.activeWarnings,
            dismissals: data.outcomesByType['DISMISSAL'] || 0
          }"
        ></app-disciplinary-summary-cards>

        <div nz-row [nzGutter]="16" class="mt-6">
          <div nz-col [nzSpan]="12">
            <nz-card nzTitle="Outcomes Breakdown">
              <nz-table #outcomeTable [nzData]="getOutcomeList(data)" [nzShowPagination]="false" [nzSize]="'small'">
                <thead>
                  <tr>
                    <th>Outcome</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of outcomeTable.data">
                    <td>{{ item.type | titlecase }}</td>
                    <td>{{ item.count }}</td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-card nzTitle="Departmental Impact">
               <nz-table #deptTable [nzData]="data.departmentalAffected" [nzShowPagination]="false" [nzSize]="'small'">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Cases</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of deptTable.data">
                    <td>{{ item.name }}</td>
                    <td><nz-badge [nzCount]="item.count" [nzStyle]="{ backgroundColor: '#52c41a' }"></nz-badge></td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DisciplinaryAnalyticsPage implements OnInit {
  dashboard = signal<DisciplinaryDashboard | null>(null);

  constructor(private erAnalytics: ErAnalyticsService) { }

  ngOnInit(): void {
    this.erAnalytics.getDisciplinaryAnalytics().subscribe(data => {
      this.dashboard.set(data);
    });
  }

  getOutcomeList(data: DisciplinaryDashboard) {
    return Object.entries(data.outcomesByType).map(([type, count]) => ({ type, count }));
  }
}
