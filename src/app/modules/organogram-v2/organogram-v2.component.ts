import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { OrgChart } from 'd3-org-chart';

type OrgNode = {
  id: string;
  parentId?: string;
  name: string;
  title: string;
};

@Component({
  selector: 'app-organogram-v2',
  templateUrl: './organogram-v2.component.html',
  styleUrl: './organogram-v2.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class OrganogramV2Component implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  private chart: OrgChart<OrgNode> | null = null;
  private data: OrgNode[] = [];
  private intervalId: any;

  ngAfterViewInit(): void {
    // 1) create local data (10 items)
    this.data = this.buildLocalData();

    // 2) create chart instance
    this.chart = new OrgChart<OrgNode>();

    // 3) init chart
    this.initChart();

    // 4) optional random highlight loop
    // this.startRandomHighlightLoop();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.chart = null;
  }

  private buildLocalData(): OrgNode[] {
    // simple tree: 1 root, 3 children, each with 2 children (total 1 + 3 + 6 = 10)
    const nodes: OrgNode[] = [];

    nodes.push({
      id: '1',
      name: 'Alex Morgan',
      title: 'Chief Executive Officer',
    });

    nodes.push(
      { id: '2', parentId: '1', name: 'Employee 2', title: 'Director' },
      { id: '3', parentId: '1', name: 'Employee 3', title: 'Director' },
      { id: '4', parentId: '1', name: 'Employee 4', title: 'Director' },
    );

    nodes.push(
      { id: '5', parentId: '2', name: 'Employee 5', title: 'Manager' },
      { id: '6', parentId: '2', name: 'Employee 6', title: 'Manager' },
      { id: '7', parentId: '3', name: 'Employee 7', title: 'Manager' },
      { id: '8', parentId: '3', name: 'Employee 8', title: 'Manager' },
      { id: '9', parentId: '4', name: 'Employee 9', title: 'Manager' },
      { id: '10', parentId: '4', name: 'Employee 10', title: 'Manager' },
    );

    return nodes;
  }

  private initChart(): void {
    if (!this.chart || !this.data) return;

    this.chart
      .container(this.chartContainer.nativeElement)
      .data(this.data)
      .nodeWidth(() => 200)
      .nodeHeight(() => 120)
         .nodeContent((node) => {
      return `<div 
        style="background-color:aqua;width:${node.width}px;height:${node.height}px"
      > 
           ${node.data.customName}
       </div>`;
    })
      .render();

    //   this.chart
    //   .container(this.chartContainer.nativeElement)
    //   .data(this.data)
    //   .nodeWidth(() => 200)
    //   .nodeHeight(() => 120)
    //      .nodeContent((node) => {
    //   return `<div 
    //     style="background-color:aqua;width:${node.width}px;height:${node.height}px"
    //   > 
    //        ${node.data.customName}
    //    </div>`;
    // })
    //   .render();
  }


  //  new d3.OrgChart()
  //   .nodeId((dataItem) => dataItem.customId)
  //   .parentNodeId((dataItem) => dataItem.customParentId)
  //   .nodeWidth((node) => 100)
  //   .nodeHeight((node) => 100)
  //   .nodeContent((node) => {
  //     return `<div 
  //       style="background-color:aqua;width:${node.width}px;height:${node.height}px"
  //     > 
  //          ${node.data.customName}
  //      </div>`;
  //   })
  //   .container('.chart-container')
  //   .data(data)
  //   .render();

  // private startRandomHighlightLoop(): void {
  //   if (!this.data || !this.chart) return;

  //   let prevIndex = 0;

  //   this.intervalId = setInterval(() => {
  //     const data = this.data;

  //     if (data[prevIndex]) {
  //       (data[prevIndex] as any)._highlighted = false;
  //       (data[prevIndex] as any)._centered = false;
  //     }

  //     const index = Math.floor(Math.random() * Math.min(10, data.length));
  //     prevIndex = index;

  //     (data[index] as any)._centered = true;
  //     (data[index] as any)._expanded = true;
  //     (data[index] as any)._highlighted = true;

  //     this.data = [...data];

  //     this.chart!.data(this.data).render();
  //   }, 1000);
  // }
}
