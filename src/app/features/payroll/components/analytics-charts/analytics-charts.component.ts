import { Component, Input, AfterViewInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import Chart from 'chart.js/auto';

@Component({
    selector: 'app-analytics-charts',
    standalone: true,
    imports: [CommonModule, NzCardModule, NzGridModule],
    template: `
    <div nz-row [nzGutter]="16">
      <div nz-col [nzSpan]="12">
        <nz-card nzTitle="Departmental Cost Breakdown">
          <canvas #deptChart></canvas>
        </nz-card>
      </div>
      <div nz-col [nzSpan]="12">
        <nz-card nzTitle="Role Distribution">
          <canvas #roleChart></canvas>
        </nz-card>
      </div>
    </div>
  `
})
export class AnalyticsChartsComponent implements AfterViewInit, OnChanges {
    @ViewChild('deptChart') deptChartRef!: ElementRef;
    @ViewChild('roleChart') roleChartRef!: ElementRef;

    @Input() deptData: any[] = [];
    @Input() roleData: any[] = [];

    private deptChart: any;
    private roleChart: any;

    ngAfterViewInit() {
        this.initCharts();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.deptChart && changes['deptData']) {
            this.updateDeptChart();
        }
        if (this.roleChart && changes['roleData']) {
            this.updateRoleChart();
        }
    }

    private initCharts() {
        this.deptChart = new Chart(this.deptChartRef.nativeElement, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Total Cost (R)',
                    data: [],
                    backgroundColor: '#1890ff'
                }]
            },
            options: { responsive: true }
        });

        this.roleChart = new Chart(this.roleChartRef.nativeElement, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: ['#1890ff', '#2fc25b', '#facc14', '#f04864', '#8543e0', '#13c2c2']
                }]
            },
            options: { responsive: true }
        });

        this.updateDeptChart();
        this.updateRoleChart();
    }

    private updateDeptChart() {
        this.deptChart.data.labels = this.deptData.map(d => d.name);
        this.deptChart.data.datasets[0].data = this.deptData.map(d => d.value);
        this.deptChart.update();
    }

    private updateRoleChart() {
        this.roleChart.data.labels = this.roleData.map(d => d.name);
        this.roleChart.data.datasets[0].data = this.roleData.map(d => d.value);
        this.roleChart.update();
    }
}
