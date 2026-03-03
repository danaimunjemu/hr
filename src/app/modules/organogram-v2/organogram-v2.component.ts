import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { OrgChart } from 'd3-org-chart';
import html2canvas from 'html2canvas';
import { Subject, takeUntil } from 'rxjs';
import { Company, OrganogramV2Node, OrganogramV2Service } from './organogram-v2.service';

@Component({
  selector: 'app-organogram-v2',
  templateUrl: './organogram-v2.component.html',
  styleUrl: './organogram-v2.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class OrganogramV2Component implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  private chart: OrgChart<OrganogramV2Node> | null = null;
  private data: OrganogramV2Node[] = [];
  private readonly destroy$ = new Subject<void>();
  private readonly parentById = new Map<string, string | undefined>();
  private readonly depthById = new Map<string, number>();
  private readonly highlightedIds = new Set<string>();

  companies: Company[] = [];
  selectedCompanyId: number | null = null;

  loading = true;
  errorMessage = '';
  unitIdInput = '';
  layout: 'top' | 'right' | 'left' | 'bottom' = 'top';
  viewMode: 'compact' | 'horizontal' = 'compact';
  colorByOrganisation = true;
  collapseByLevelEnabled = false;
  searchQuery = '';
  searchMatches: string[] = [];
  currentSearchIndex = 0;

  private readonly companyThemeCache = new Map<
    string,
    {
      accent: string;
      badgeBg: string;
      badgeBorder: string;
      badgeText: string;
    }
  >();

  private readonly companyThemes = [
    { accent: '#F04040', badgeBg: '#FEE2E2', badgeBorder: '#FCA5A5', badgeText: '#991B1B' },
    { accent: '#0f766e', badgeBg: '#ecfeff', badgeBorder: '#99f6e4', badgeText: '#134e4a' },
    { accent: '#be123c', badgeBg: '#fff1f2', badgeBorder: '#fecdd3', badgeText: '#9f1239' },
    { accent: '#7c3aed', badgeBg: '#f5f3ff', badgeBorder: '#ddd6fe', badgeText: '#5b21b6' },
    { accent: '#b45309', badgeBg: '#fffbeb', badgeBorder: '#fde68a', badgeText: '#92400e' },
    { accent: '#0369a1', badgeBg: '#f0f9ff', badgeBorder: '#bae6fd', badgeText: '#0c4a6e' },
  ];

  get hasChartData(): boolean {
    return this.data.length > 0;
  }

  constructor(
    private readonly service: OrganogramV2Service,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.chart = new OrgChart<OrganogramV2Node>();
    this.loadCompanies();
  }

  onCompanyChange(companyId: number | null): void {
    this.selectedCompanyId = companyId;
    if (companyId) {
      this.loadCompanyOrganogram(companyId);
    } else {
      this.data = [];
      this.renderChart();
      this.cdr.markForCheck();
    }
  }

  private loadCompanies(): void {
    this.service.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        if (this.companies.length) {
          this.selectedCompanyId = this.companies[0].id;
          this.loadCompanyOrganogram(this.selectedCompanyId);
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load companies.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private loadCompanyOrganogram(companyId: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.service
      .getCompanyOrganogram(companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (nodes) => {
          this.data = nodes;
          this.rebuildIndexes();
          this.highlightedIds.clear();
          this.clearSearchState();
          this.loading = false;
          this.renderChart();
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.errorMessage = `Failed to load organogram for company ${companyId}.`;
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chart = null;
  }

  loadFullOrganogram(): void {
    this.loading = true;
    this.errorMessage = '';

    this.service
      .getOrganogram()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (nodes) => {
          this.data = nodes;
          this.rebuildIndexes();
          this.highlightedIds.clear();
          this.clearSearchState();
          this.loading = false;
          this.renderChart();
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Failed to load full organogram.';
          this.cdr.markForCheck();
        },
      });
  }

  loadDepartmentOrganogram(): void {
    const unitId = Number(this.selectedCompanyId);
    if (!unitId) {
      this.errorMessage = 'Enter a valid organizational unit ID.';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.service
      .getDepartmentOrganogram(unitId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (nodes) => {
          this.data = nodes;
          this.rebuildIndexes();
          this.highlightedIds.clear();
          this.clearSearchState();
          this.loading = false;
          this.renderChart();
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.errorMessage = `Failed to load organogram for unit ${unitId}.`;
          this.cdr.markForCheck();
        },
      });
  }

  zoomIn(): void {
    (this.chart as any)?.zoomIn?.();
  }

  zoomOut(): void {
    (this.chart as any)?.zoomOut?.();
  }

  fitScreen(): void {
    (this.chart as any)?.fit?.();
  }

  openAll(): void {
    const chartAny = this.chart as any;
    chartAny?.expandAll?.();
    chartAny?.render?.();
    chartAny?.fit?.();
  }

  collapseAll(): void {
    const chartAny = this.chart as any;
    chartAny?.collapseAll?.();
    chartAny?.render?.();
    chartAny?.fit?.();
  }

  setLayout(layout: 'top' | 'right' | 'left' | 'bottom'): void {
    this.layout = layout;
    this.renderChart();
  }

  setViewMode(mode: 'compact' | 'horizontal'): void {
    this.viewMode = mode;
    this.renderChart();
  }

  selectedValue = null;

  toggleOrganisationColors(): void {
    this.colorByOrganisation = !this.colorByOrganisation;
    this.renderChart();
  }

  toggleCollapseByLevel(): void {
    this.collapseByLevelEnabled = !this.collapseByLevelEnabled;
  }

  searchOnChart(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.clearSearchState();
      this.renderChart();
      this.cdr.markForCheck();
      return;
    }

    const matches = this.data
      .filter((node) => {
        const haystack = `${node.name} ${node.title} ${node.department} ${node.employeeNumber || ''}`.toLowerCase();
        return haystack.includes(query);
      })
      .map((node) => node.id);

    this.searchMatches = matches;
    this.currentSearchIndex = 0;
    this.focusCurrentSearchMatch();
    this.cdr.markForCheck();
  }

  nextSearchResult(): void {
    if (!this.searchMatches.length) {
      return;
    }
    this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchMatches.length;
    this.focusCurrentSearchMatch();
  }

  previousSearchResult(): void {
    if (!this.searchMatches.length) {
      return;
    }
    this.currentSearchIndex = (this.currentSearchIndex - 1 + this.searchMatches.length) % this.searchMatches.length;
    this.focusCurrentSearchMatch();
  }

  async downloadHdPdf(): Promise<void> {
    try {
      const chartAny = this.chart as any;
      chartAny?.expandAll?.();
      chartAny?.render?.();
      chartAny?.fit?.();
      await this.waitForNextFrame();

      const target = this.chartContainer.nativeElement;
      const canvas = await html2canvas(target, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        logging: false,
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight,
      });

      const jpegDataUrl = canvas.toDataURL('image/jpeg', 1.0);
      const pdfBlob = this.buildPdfFromJpegDataUrl(jpegDataUrl, canvas.width, canvas.height);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'organogram-hd.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      this.errorMessage = 'Failed to download HD PDF.';
      this.cdr.markForCheck();
    }
  }

  private renderChart(): void {
    if (!this.chart) {
      return;
    }

    if (!this.data.length) {
      this.clearChart();
      return;
    }

    const chartAny = this.chart as any;
    const isCompact = this.viewMode === 'compact';
    const effectiveLayout = isCompact ? this.layout : 'left';

    chartAny
      .container(this.chartContainer.nativeElement)
      .nodeId((d: OrganogramV2Node) => d.id)
      .parentNodeId((d: OrganogramV2Node) => d.parentId)
      .data(this.data)
      .layout(effectiveLayout)
      .compact(isCompact)
      .childrenMargin(() => (isCompact ? 34 : 44))
      .neighbourMargin(() => (isCompact ? 30 : 34))
      .compactMarginBetween(() => (isCompact ? 18 : 26))
      .compactMarginPair(() => (isCompact ? 20 : 26))
      .nodeWidth(() => (isCompact ? 176 : 210))
      .nodeHeight(() => (isCompact ? 80 : 90))
      .onNodeClick((node: any) => this.highlightToRoot(node.data as OrganogramV2Node))
      .onExpandOrCollapse((node: any) => this.onExpandOrCollapse(node))
      .linkUpdate(function (this: SVGPathElement, link: any) {
        const parentId = link?.data?.source?.data?.id || '';
        const colors = ['#F04040', '#0ea5e9', '#6366f1', '#22c55e', '#ec4899'];
        let hash = 0;
        for (let i = 0; i < parentId.length; i += 1) {
          hash = (hash << 5) - hash + parentId.charCodeAt(i);
          hash |= 0;
        }
        const color = colors[Math.abs(hash) % colors.length];

        this.setAttribute('stroke', color);
        this.setAttribute('stroke-width', '2');
        this.setAttribute('stroke-linecap', 'round');
      })
      .nodeContent((node: any) => this.nodeTemplate(node))
      .render();

    chartAny.fit?.();
  }

  private clearChart(): void {
    const element = this.chartContainer?.nativeElement;
    if (element) {
      element.innerHTML = '';
    }
  }

  private nodeTemplate(node: { data: OrganogramV2Node; width: number; height: number }): string {
    const data = node.data;
    const name = this.escapeHtml(data.name);
    const title = this.escapeHtml(data.title || 'N/A');
    const department = this.escapeHtml(data.department || 'N/A');
    const initials = this.escapeHtml(data.initials || 'NA');

    const theme = this.getCompanyTheme(data.companyName || 'N/A');

    const classes = [
      'org-card',
      this.highlightedIds.has(data.id) ? 'org-card-highlighted' : '',
      this.searchMatches.includes(data.id) ? 'org-card-search-hit' : '',
      this.searchMatches[this.currentSearchIndex] === data.id ? 'org-card-search-current' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const companyStyle = this.colorByOrganisation ? `--company-accent:${theme.accent};` : '';

    return `
      <div class="${classes}" style="width:${node.width}px;height:${node.height}px;${companyStyle}">
        <div class="org-card-inner">
          <div class="org-card-avatar">
            <span class="org-card-avatar-initials">${initials}</span>
          </div>
          <div class="org-card-text">
            <div class="org-card-name" title="${name}">${name}</div>
            <div class="org-card-title" title="${title}">${title}</div>
            <div class="org-card-meta">
              <span class="org-card-dot"></span>
              <span class="org-card-dept" title="${department}">${department}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getCompanyTheme(companyName: string): {
    accent: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
  } {
    const key = companyName.trim().toLowerCase() || 'n-a';
    const cached = this.companyThemeCache.get(key);
    if (cached) {
      return cached;
    }

    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    const theme = this.companyThemes[Math.abs(hash) % this.companyThemes.length];
    this.companyThemeCache.set(key, theme);
    return theme;
  }

  private rebuildIndexes(): void {
    this.parentById.clear();
    this.depthById.clear();
    for (const node of this.data) {
      this.parentById.set(node.id, node.parentId);
    }

    for (const node of this.data) {
      let depth = 0;
      let currentId: string | undefined = node.id;
      const seen = new Set<string>();
      while (currentId && !seen.has(currentId)) {
        seen.add(currentId);
        const parentId = this.parentById.get(currentId);
        if (!parentId) {
          break;
        }
        depth += 1;
        currentId = parentId;
      }
      this.depthById.set(node.id, depth);
    }
  }

  private highlightToRoot(node: OrganogramV2Node): void {
    this.highlightedIds.clear();
    let currentId: string | undefined = node.id;
    const seen = new Set<string>();

    while (currentId && !seen.has(currentId)) {
      seen.add(currentId);
      this.highlightedIds.add(currentId);
      currentId = this.parentById.get(currentId);
    }

    (this.chart as any)?.setCentered?.(node.id);
    this.renderChart();
  }

  private onExpandOrCollapse(node: any): void {
    if (!this.collapseByLevelEnabled) {
      return;
    }

    const collapsed = node?.data?._expanded === false;
    if (!collapsed) {
      return;
    }

    const nodeId = String(node?.data?.id || '');
    if (!nodeId) {
      return;
    }

    const targetDepth = this.depthById.get(nodeId);
    if (targetDepth === undefined) {
      return;
    }

    const chartAny = this.chart as any;
    for (const [id, depth] of this.depthById.entries()) {
      if (depth === targetDepth) {
        chartAny?.setExpanded?.(id, false);
      }
    }
    chartAny?.render?.();
    chartAny?.fit?.();
  }

  private focusCurrentSearchMatch(): void {
    const nodeId = this.searchMatches[this.currentSearchIndex];
    if (!nodeId) {
      this.renderChart();
      return;
    }

    const node = this.data.find((item) => item.id === nodeId);
    if (node) {
      this.highlightToRoot(node);
    } else {
      this.renderChart();
    }
  }

  private clearSearchState(): void {
    this.searchMatches = [];
    this.currentSearchIndex = 0;
    this.cdr.markForCheck();
  }

  onSearchCleared(): void {
    this.searchQuery = '';
    this.clearSearchState();
    this.renderChart();
    this.cdr.markForCheck();
  }

  private buildPdfFromJpegDataUrl(jpegDataUrl: string, imageWidth: number, imageHeight: number): Blob {
    const base64 = jpegDataUrl.split(',')[1] || '';
    const binary = atob(base64);
    const imageBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      imageBytes[i] = binary.charCodeAt(i);
    }

    const encoder = new TextEncoder();
    const chunks: Uint8Array[] = [];
    const offsets: number[] = [0];
    let offset = 0;

    const pushBytes = (bytes: Uint8Array): void => {
      chunks.push(bytes);
      offset += bytes.length;
    };

    const pushText = (text: string): void => {
      pushBytes(encoder.encode(text));
    };

    const pageWidth = 842;
    const pageHeight = 595;
    const ratio = Math.min(pageWidth / imageWidth, pageHeight / imageHeight);
    const drawWidth = imageWidth * ratio;
    const drawHeight = imageHeight * ratio;
    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    const contentStream = `q\n${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(
      2,
    )} cm\n/Im0 Do\nQ\n`;
    const contentLength = encoder.encode(contentStream).length;

    pushText('%PDF-1.3\n');

    offsets[1] = offset;
    pushText('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    offsets[2] = offset;
    pushText('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

    offsets[3] = offset;
    pushText(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
    );

    offsets[4] = offset;
    pushText(
      `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`,
    );
    pushBytes(imageBytes);
    pushText('\nendstream\nendobj\n');

    offsets[5] = offset;
    pushText(`5 0 obj\n<< /Length ${contentLength} >>\nstream\n${contentStream}endstream\nendobj\n`);

    const xrefStart = offset;
    pushText('xref\n0 6\n');
    pushText('0000000000 65535 f \n');
    for (let i = 1; i <= 5; i += 1) {
      const value = String(offsets[i] || 0).padStart(10, '0');
      pushText(`${value} 00000 n \n`);
    }

    pushText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

    return new Blob(chunks as unknown as BlobPart[], { type: 'application/pdf' });
  }

  private waitForNextFrame(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
