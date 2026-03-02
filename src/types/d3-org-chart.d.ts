declare module 'd3-org-chart' {
  export interface OrgChartExportImageOptions {
    full?: boolean;
    scale?: number;
    filename?: string;
  }

  export interface OrgChartExportSvgOptions {
    filename?: string;
  }

  export class OrgChart<TData = any> {
    container(value: HTMLElement): this;
    data(value: TData[]): this;
    render(): this;
    nodeWidth(value: number | ((node: any) => number)): this;
    nodeHeight(value: number | ((node: any) => number)): this;
    childrenMargin(value: number): this;
    neighbourMargin(value: number): this;
    compactMarginBetween(value: number): this;
    compactMarginPair(value: number): this;
    nodeContent(value: (node: any) => string): this;
    buttonContent(value: (node: any) => string): this;
    onNodeClick(value: (node: any) => void): this;
    nodeUpdate(value: (this: SVGGElement, node: any) => void): this;
    linkUpdate(value: (this: SVGPathElement, link: any) => void): this;
    layout(value: 'left' | 'top'): this;
    compact(value: boolean): this;
    duration(value: number): this;
    zoomBehavior(value: any): this;
    scaleExtent(value: [number, number]): this;
    zoomIn(): this;
    zoomOut(): this;
    fit(): this;
    expandAll(): this;
    collapseAll(): this;
    setCentered(nodeId: string): this;
    exportImg(options?: OrgChartExportImageOptions): this;
    exportSvg(options?: OrgChartExportSvgOptions): this;
  }
}
