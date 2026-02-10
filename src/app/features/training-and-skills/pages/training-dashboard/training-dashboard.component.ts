import { Component, OnInit, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { TrainingService } from '../../services/training.service';
import { Chart } from '@antv/g2';
import { TrainingStats } from '../../models/training.model';

@Component({
  selector: 'app-training-dashboard',
  standalone: false,
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">Training Overview</h1>
      
      <!-- KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <nz-card>
          <nz-statistic [nzValue]="stats?.totalPrograms || 0" [nzTitle]="'Active Programs'" [nzPrefix]="prefixBook"></nz-statistic>
          <ng-template #prefixBook><span nz-icon nzType="read" nzTheme="twotone"></span></ng-template>
        </nz-card>
        <nz-card>
          <nz-statistic [nzValue]="stats?.upcomingSessions || 0" [nzTitle]="'Upcoming Sessions'" [nzPrefix]="prefixCal"></nz-statistic>
          <ng-template #prefixCal><span nz-icon nzType="calendar" nzTheme="twotone" [nzTwotoneColor]="'#52c41a'"></span></ng-template>
        </nz-card>
        <nz-card>
          <nz-statistic [nzValue]="stats?.employeesTrainedMonth || 0" [nzTitle]="'Employees Trained (Month)'" [nzPrefix]="prefixUser"></nz-statistic>
          <ng-template #prefixUser><span nz-icon nzType="team" nzTheme="twotone" [nzTwotoneColor]="'#1890ff'"></span></ng-template>
        </nz-card>
        <nz-card>
          <nz-statistic [nzValue]="stats?.expiringCertifications || 0" [nzTitle]="'Expiring Certifications'" [nzPrefix]="prefixWarning"></nz-statistic>
          <ng-template #prefixWarning><span nz-icon nzType="warning" nzTheme="twotone" [nzTwotoneColor]="'#faad14'"></span></ng-template>
        </nz-card>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <nz-card nzTitle="Monthly Training Hours">
          <div #chartContainer class="h-64"></div>
        </nz-card>
        <nz-card nzTitle="Training by Type">
          <div #chartContainer class="h-64"></div>
        </nz-card>
      </div>
    </div>
  `
})
export class TrainingDashboardComponent implements OnInit, AfterViewInit {
  stats: TrainingStats | null = null;
  @ViewChildren('chartContainer') chartContainers!: QueryList<ElementRef>;

  constructor(private trainingService: TrainingService) {}

  ngOnInit() {
    this.trainingService.getStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.stats && this.chartContainers) {
        this.renderCharts();
      }
    }, 500);
  }

  renderCharts() {
    const containers = this.chartContainers.toArray();
    
    if (containers[0]) {
      const chart1 = new Chart({ container: containers[0].nativeElement, autoFit: true });
      chart1.line().data(this.stats?.hoursByMonth || []).encode('x', 'month').encode('y', 'hours').style('stroke', '#1890ff').style('lineWidth', 2);
      chart1.point().data(this.stats?.hoursByMonth || []).encode('x', 'month').encode('y', 'hours').style('fill', '#fff').style('stroke', '#1890ff');
      chart1.render();
    }

    if (containers[1]) {
      const chart2 = new Chart({ container: containers[1].nativeElement, autoFit: true });
      chart2.coordinate({ type: 'theta', outerRadius: 0.8 });
      chart2.interval().data(this.stats?.typeDistribution || [])
        .transform({ type: 'stackY' })
        .encode('y', 'count')
        .encode('color', 'type');
      chart2.render();
    }
  }
}
