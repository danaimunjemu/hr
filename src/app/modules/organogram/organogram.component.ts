import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, computed, signal } from '@angular/core';
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
export class OrganogramComponent implements OnInit, OnDestroy {
 @ViewChild(NgxInteractiveOrgChart) orgChart?: NgxInteractiveOrgChart<OrganogramNode>;
  private readonly destroy$ = new Subject<void>();

  private readonly _loading = signal(false);
  private readonly _profileLoading = signal(false);
  private readonly _searchLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _chartData = signal<OrganogramNode | null>(null);
  private readonly _drawerVisible = signal(false);
  private readonly _selectedProfile = signal<OrganogramEmployeeProfile | null>(null);
  private readonly _focusedEmployeeId = signal<string | null>(null);
  private readonly _searchEmpty = signal(false);

  searchQuery = '';
  departmentFilter: number | 'ALL' = 'ALL';

  readonly loading = computed(() => this._loading());
  readonly profileLoading = computed(() => this._profileLoading());
  readonly searchLoading = computed(() => this._searchLoading());
  readonly error = computed(() => this._error());
  readonly chartData = computed(() => this._chartData());
  readonly drawerVisible = computed(() => this._drawerVisible());
  readonly selectedProfile = computed(() => this._selectedProfile());
  readonly focusedEmployeeId = computed(() => this._focusedEmployeeId());
  readonly searchEmpty = computed(() => this._searchEmpty());

  readonly departmentOptions = computed<DepartmentOption[]>(() => {
    const map = new Map<number, string>();
    const nodes = this.flattenNodes(this._chartData());
    for (const node of nodes) {
      if (node.departmentId && node.department) {
        map.set(node.departmentId, node.department);
      }
    }
    return [...map.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id, label]) => ({ id, label }));
  });

  readonly themeOptions: NgxInteractiveOrgChartTheme = {
    node: {
      background: '#ffffff',
      color: '#2c3e50',
      shadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
      outlineColor: 'rgba(44, 62, 80, 0.08)',
      outlineWidth: '1px',
      activeOutlineColor: 'rgba(44, 62, 80, 0.25)',
      highlightShadowColor: 'rgba(44, 62, 80, 0.12)',
      padding: '8px 10px',
      borderRadius: '10px',
      containerSpacing: '18px',
      maxWidth: '220px',
      minWidth: '200px'
    },
    connector: {
      color: 'rgba(44, 62, 80, 0.18)',
      activeColor: 'rgba(44, 62, 80, 0.45)',
      width: '1px',
      borderRadius: '8px'
    },
    collapseButton: {
      size: '18px',
      borderColor: 'rgba(44, 62, 80, 0.2)',
      borderRadius: '6px',
      color: '#2c3e50',
      background: '#f3f6f9',
      hoverColor: '#2c3e50',
      hoverBackground: '#e8eef3',
      hoverShadow: '0 4px 10px rgba(15, 23, 42, 0.08)',
      hoverTransformScale: '1.05',
      focusOutline: '2px solid rgba(44, 62, 80, 0.2)',
      countFontSize: '10px'
    },
    container: {
      background: 'transparent',
      border: 'none'
    }
  };

  private employeeIndex = new Map<string, OrganogramNode>();

  constructor(
    private organogramService: OrganogramService,
    private mapper: OrganogramMapper,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrganogram();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrganogram(): void {
    this._loading.set(true);
    this._error.set(null);
    this._searchEmpty.set(false);

    this.organogramService
      .getOrganogram()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this._loading.set(false);
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: OrganogramPositionResponse[]) => {
          this.applyChartData(response);
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this._chartData.set(null);
          this._error.set(err?.error?.message || 'Failed to load organogram.');
          this.cdr.detectChanges();
        }
      });
  }

  onDepartmentChange(value: number | 'ALL'): void {
    this.departmentFilter = value;
    this._focusedEmployeeId.set(null);
    this._searchEmpty.set(false);

    if (value === 'ALL') {
      this.loadOrganogram();
      return;
    }

    this._loading.set(true);
    this.organogramService
      .getDepartmentOrganogram(Number(value))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this._loading.set(false);
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.applyChartData(response);
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this._chartData.set(null);
          this._error.set(err?.error?.message || 'Failed to load department organogram.');
          this.cdr.detectChanges();
        }
      });
  }

  onSearch(): void {
    const query = this.searchQuery.trim();
    if (!query) {
      this._focusedEmployeeId.set(null);
      this._searchEmpty.set(false);
      return;
    }

    this._searchLoading.set(true);
    this.organogramService
      .searchEmployee(query)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this._searchLoading.set(false);
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (result) => {
          const employeeId = this.extractEmployeeId(result);
          if (!employeeId) {
            this._focusedEmployeeId.set(null);
            this._searchEmpty.set(true);
            return;
          }

          const nodeId = `emp-${employeeId}`;
          if (!this.employeeIndex.has(nodeId)) {
            this._focusedEmployeeId.set(null);
            this._searchEmpty.set(true);
            return;
          }

          this._searchEmpty.set(false);
          this._focusedEmployeeId.set(nodeId);
          queueMicrotask(() => this.orgChart?.highlightNode(nodeId));
        },
        error: (err: any) => {
          this._searchEmpty.set(false);
          this.message.error(err?.error?.message || 'Search failed.');
        }
      });
  }

  openProfile(node: OrganogramNode): void {
    const employeeId = Number(node?.employeeId || 0);
    if (!employeeId) {
      return;
    }

    this._profileLoading.set(true);
    this._drawerVisible.set(true);

    this.organogramService
      .getEmployeeProfile(employeeId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this._profileLoading.set(false);
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (profile) => {
          this._selectedProfile.set(profile);
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.message.error(err?.error?.message || 'Failed to load employee profile.');
          this.cdr.detectChanges();
        }
      });
  }

  closeProfile(): void {
    this._drawerVisible.set(false);
  }

  resetView(): void {
    this.orgChart?.resetPanAndZoom(40);
  }

  zoomIn(): void {
    this.orgChart?.zoomIn({ by: 10, relative: true });
  }

  zoomOut(): void {
    this.orgChart?.zoomOut({ by: 10, relative: true });
  }

  employeeFullName(profile: OrganogramEmployeeProfile | null): string {
    const first = String(profile?.firstName || '').trim();
    const last = String(profile?.lastName || '').trim();
    const full = `${first} ${last}`.trim();
    return full || 'Unknown Employee';
  }

  private applyChartData(response: OrganogramPositionResponse[]): void {
    const chartData = this.mapper.mapToChart(response);
    this._chartData.set(chartData);
    this.rebuildEmployeeIndex(chartData);
    this._focusedEmployeeId.set(null);
    this._error.set(null);
    queueMicrotask(() => this.orgChart?.resetPanAndZoom(40));
  }

  private rebuildEmployeeIndex(root: OrganogramNode | null): void {
    this.employeeIndex.clear();
    if (!root) {
      return;
    }
    const stack: OrganogramNode[] = [root];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;
      this.employeeIndex.set(node.id, node);
      if (Array.isArray(node.children)) {
        stack.push(...node.children);
      }
    }
  }

  private flattenNodes(root: OrganogramNode | null): OrganogramNode[] {
    if (!root) return [];
    const output: OrganogramNode[] = [];
    const stack: OrganogramNode[] = [root];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;
      output.push(node);
      if (Array.isArray(node.children)) {
        stack.push(...node.children);
      }
    }
    return output;
  }

  private extractEmployeeId(result: unknown): number | null {
    const fromItem = (item: any): number | null => {
      const direct = Number(item?.id || 0);
      if (direct) return direct;
      const nested = Number(item?.employee?.id || 0);
      if (nested) return nested;
      const nestedArray = Number(item?.employees?.[0]?.id || 0);
      if (nestedArray) return nestedArray;
      return null;
    };

    if (Array.isArray(result)) {
      for (const item of result) {
        const found = fromItem(item);
        if (found) return found;
      }
      return null;
    }

    return fromItem(result);
  }
}
