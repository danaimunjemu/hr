import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  NgxInteractiveOrgChart,
  NgxInteractiveOrgChartTheme
} from 'ngx-interactive-org-chart';
import { finalize, Subject, takeUntil } from 'rxjs';
import {
  OrganogramEmployeeProfile,
  OrganogramNode,
  OrganogramPositionResponse
} from './organogram.models';
import { OrganogramMapper } from './organogram.mapper';
import { OrganogramService } from './organogram.service';
import d3 from 'd3';
import { OrgChart } from 'd3-org-chart';

interface DepartmentOption {
  id: number;
  label: string;
}

@Component({
  selector: 'app-organogram',
  standalone: false,
  templateUrl: './organogram.component.html',
  styleUrl: './organogram.component.scss'
})
export class OrganogramComponent implements OnInit {
  @ViewChild('chartContainer')
  chartContainer!: ElementRef;
  data: any;
  chart: OrgChart<any> | undefined;

  ngOnInit() {
    d3.csv(
      'https://raw.githubusercontent.com/bumbeishvili/sample-data/main/org.csv'
    ).then(data => {
      this.data = data;
      let prevIndex = 0;
      // setInterval(d => {
      //   data[prevIndex]._highlighted = false;
      //   let index = Math.floor(Math.random() * 10);
      //   prevIndex = index;
      //   data[index]._centered = true;
      //   data[index]._expanded = true;
      //   data[index]._highlighted = true;
      //   this.data = Object.assign([], data);
      // }, 1000);
    }
  
  );
  }

  constructor() {}


  ngAfterViewInit() {
    if (!this.chart) {
      this.chart = new OrgChart();
    }
    this.updateChart();
  }

  ngOnChanges() {
    this.updateChart();
  }
  updateChart() {
    if (!this.data) {
      return;
    }
    if (!this.chart) {
      return;
    }
    this.chart
      .container(this.chartContainer.nativeElement)
      .data(this.data)
      .nodeWidth(d => 200)
      .nodeHeight(d => 120)
      .render();
  }
}
