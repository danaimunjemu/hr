import { ChangeDetectorRef, Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Batch, BatchException, BatchService } from '../../../services/bulk-onboarding';

type RecordMode = 'ALL' | 'SUCCESS' | 'FAILED' | 'EXCEPTIONS';
type RecordOutcome = 'SUCCESS' | 'FAILED' | 'EXCEPTIONS';

interface BatchRow {
  id: string;
  employeeNumber: string;
  name: string;
  email: string;
  jobTitle: string;
  outcome: RecordOutcome;
  stage: string;
  exceptionMessage: string;
}

interface TimelineEvent {
  title: string;
  actor: string;
  timestamp: string | null;
  status: string;
  detail?: string;
}

@Component({
  selector: 'app-batch-detail',
  standalone: false,
  templateUrl: './batch-detail.html',
  styleUrl: './batch-detail.scss'
})
export class BatchDetail implements OnInit {
  private _loading = signal(false);
  private _actionLoading = signal(false);
  private _exceptionLoading = signal(false);
  private _downloading = signal(false);
  private _batch = signal<Batch | null>(null);
  private _exceptions = signal<BatchException[]>([]);
  private _tableMode = signal<RecordMode>('ALL');
  private _tableSearch = signal('');
  private _tableFullscreen = signal(false);
  private currentBatchId = 0;

  segmentedOptions = [
    { label: 'All',        value: 'ALL',        icon: 'appstore' },
    { label: 'Success',    value: 'SUCCESS',    icon: 'check-circle' },
    { label: 'Failed',     value: 'FAILED',     icon: 'close-circle' },
    { label: 'Exceptions', value: 'EXCEPTIONS', icon: 'warning' }
  ];

  loading = computed(() => this._loading());
  actionLoading = computed(() => this._actionLoading());
  exceptionLoading = computed(() => this._exceptionLoading());
  downloading = computed(() => this._downloading());
  batch = computed(() => this._batch());
  exceptions = computed(() => this._exceptions());
  tableMode = computed(() => this._tableMode());
  tableSearch = computed(() => this._tableSearch());
  tableFullscreen = computed(() => this._tableFullscreen());

  allRows = computed<BatchRow[]>(() => {
    const b = this._batch();
    if (!b) {
      return [];
    }

    const rows: BatchRow[] = [];
    const exceptionMap = new Map<string, BatchException[]>();
    const employees = Array.isArray(b.employees) ? b.employees : [];

    for (const ex of this._exceptions()) {
      const key = String(ex.employeeNumber || 'N/A');
      const bucket = exceptionMap.get(key) || [];
      bucket.push(ex);
      exceptionMap.set(key, bucket);
    }

    for (const emp of employees) {
      const employeeNumber = String(emp?.employeeNumber || 'N/A');
      const related = exceptionMap.get(employeeNumber) || [];
      const primaryException = related[0];
      const stage = String(primaryException?.stage || '-');
      const outcome = this.exceptionOutcome(primaryException);
      const hasException = !!primaryException;

      rows.push({
        id: `emp-${String(emp?.id ?? employeeNumber)}`,
        employeeNumber,
        name: `${String(emp?.firstName || '')} ${String(emp?.lastName || '')}`.trim() || '-',
        email: String(emp?.email || '-'),
        jobTitle: String(emp?.jobDescription?.name || '-'),
        outcome: hasException ? outcome : 'SUCCESS',
        stage: hasException ? stage : 'COMPLETED',
        exceptionMessage: hasException ? String(primaryException?.exceptionMessage || 'N/A') : ''
      });

      exceptionMap.delete(employeeNumber);
    }

    for (const [employeeNumber, items] of exceptionMap.entries()) {
      const primaryException = items[0];
      rows.push({
        id: `ex-${primaryException?.id ?? employeeNumber}`,
        employeeNumber: String(employeeNumber || 'N/A'),
        name: '-',
        email: '-',
        jobTitle: '-',
        outcome: this.exceptionOutcome(primaryException),
        stage: String(primaryException?.stage || '-'),
        exceptionMessage: String(primaryException?.exceptionMessage || 'N/A')
      });
    }

    return rows;
  });

  filteredRows = computed<BatchRow[]>(() => {
    const mode = this._tableMode();
    const term = this._tableSearch().trim().toLowerCase();

    return this.allRows().filter((row) => {
      const modeMatch =
        mode === 'ALL' ||
        (mode === 'SUCCESS' && row.outcome === 'SUCCESS') ||
        (mode === 'FAILED' && row.outcome === 'FAILED') ||
        (mode === 'EXCEPTIONS' && row.outcome === 'EXCEPTIONS');

      if (!modeMatch) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = `${row.employeeNumber} ${row.name} ${row.email} ${row.jobTitle} ${row.outcome} ${row.stage} ${row.exceptionMessage}`.toLowerCase();
      return haystack.includes(term);
    });
  });

  totalRows = computed(() => this.allRows().length);
  successCount = computed(() => this.allRows().filter((row) => row.outcome === 'SUCCESS').length);
  failedCount = computed(() => this.allRows().filter((row) => row.outcome === 'FAILED').length);
  exceptionCount = computed(() => this.allRows().filter((row) => row.outcome === 'EXCEPTIONS').length);

  completionPercent = computed(() => {
    const total = this.totalRows();
    if (!total) return 0;
    const resolved = this.successCount() + this.failedCount();
    return Math.round((resolved / total) * 100);
  });

  successPercent = computed(() => {
    const total = this.totalRows();
    if (!total) return 0;
    return Math.round((this.successCount() / total) * 100);
  });

  exceptionPercent = computed(() => {
    const total = this.totalRows();
    if (!total) return 0;
    return Math.round((this.exceptionCount() / total) * 100);
  });

  timelineEvents = computed<TimelineEvent[]>(() => {
    const b = this._batch();
    if (!b) {
      return [];
    }

    const events: TimelineEvent[] = [
      {
        title: 'Batch Created',
        actor: b.inputter || 'System',
        timestamp: b.inputDateTime || b.createdOn || null,
        status: 'CREATED',
        detail: `File: ${b.originalName || b.name}`
      },
      {
        title: 'Validation Summary',
        actor: 'System',
        timestamp: b.updatedOn || b.createdOn || null,
        status: this.exceptionCount() ? 'FAILED' : 'AUTHORIZED',
        detail: `${this.successCount()} success, ${this.failedCount()} failed, ${this.exceptionCount()} exceptions`
      }
    ];

    if (b.authorizeDateTime) {
      events.push({
        title: 'Batch Authorized',
        actor: b.authorizer || 'Approver',
        timestamp: b.authorizeDateTime,
        status: 'AUTHORIZED'
      });
    }

    if (b.error) {
      events.push({
        title: 'Batch Error',
        actor: 'System',
        timestamp: b.updatedOn || null,
        status: 'FAILED',
        detail: b.error
      });
    }

    events.push({
      title: 'Current Status',
      actor: 'System',
      timestamp: b.updatedOn || b.createdOn || null,
      status: b.status
    });

    return events.sort((a, bEvent) => {
      const left = new Date(a.timestamp || 0).getTime();
      const right = new Date(bEvent.timestamp || 0).getTime();
      return left - right;
    });
  });

  showExceptionMessage = computed(() => this._tableMode() === 'EXCEPTIONS');

  get fileTypeLabel(): string {
    const b = this.batch();
    if (!b) return '';
    const name = b.originalName || b.name || b.url || '';
    const parts = name.split('.');
    if (parts.length < 2) return 'Unknown';
    return parts.pop()!.toUpperCase();
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private batchService: BatchService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.currentBatchId = id;
      this.refreshAll(id);
    }
  }

  refreshAll(batchId: number): void {
    this.load(batchId);
    this.loadExceptions(batchId);
  }

  load(id: number): void {
    this._loading.set(true);
    this.batchService.getById(id).subscribe({
      next: (batch) => {
        this._batch.set(batch);
        this._loading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this._loading.set(false);
        const msg = err?.error?.message || 'Failed to load batch.';
        this.message.error(msg);
        this.router.navigate(['/app/onboarding/batches']);
        this.cdr.detectChanges();
      }
    });
  }

  loadExceptions(batchId: number): void {
    this._exceptionLoading.set(true);
    this.batchService.getExceptionsByBatch(batchId).subscribe({
      next: (exceptions) => {
        this._exceptions.set(exceptions);
        this._exceptionLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this._exceptionLoading.set(false);
        const msg = err?.error?.message || 'Failed to load exceptions.';
        this.message.error(msg);
        this.cdr.detectChanges();
      }
    });
  }

  authorize(): void {
    const b = this._batch();
    if (!b || this._actionLoading()) return;
    this._actionLoading.set(true);
    this.batchService.authorize(b.id).subscribe({
      next: () => {
        this.message.success('Batch authorized.');
        this._actionLoading.set(false);
        this.refreshAll(b.id);
      },
      error: (err) => {
        this._actionLoading.set(false);
        const msg = err?.error?.message || 'Failed to authorize batch.';
        this.message.error(msg);
        this.cdr.detectChanges();
      }
    });
  }

  delete(): void {
    const b = this._batch();
    if (!b || this._actionLoading()) return;
    this._actionLoading.set(true);
    this.batchService.delete(b.id).subscribe({
      next: () => {
        this._actionLoading.set(false);
        this.message.success('Batch deleted.');
        this.router.navigate(['/app/onboarding/batches']);
      },
      error: (err) => {
        this._actionLoading.set(false);
        const msg = err?.error?.message || 'Failed to delete batch.';
        this.message.error(msg);
        this.cdr.detectChanges();
      }
    });
  }

  downloadExceptions(): void {
    if (!this.currentBatchId || this._downloading()) return;
    this._downloading.set(true);
    this.batchService.getExceptionsByBatch(this.currentBatchId).subscribe({
      next: (exceptions) => {
        this._exceptions.set(exceptions);
        const csv = this.toCsv(exceptions);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `batch-${this.currentBatchId}-exceptions.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
        this._downloading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this._downloading.set(false);
        const msg = err?.error?.message || 'Failed to download exceptions.';
        this.message.error(msg);
        this.cdr.detectChanges();
      }
    });
  }

  setTableMode(mode: RecordMode): void {
    this._tableMode.set(mode);
  }

  onTableSearch(term: string): void {
    this._tableSearch.set(term);
  }

  toggleFullscreen(): void {
    this._tableFullscreen.set(!this._tableFullscreen());
  }

  rowStatusColor(outcome: RecordOutcome): 'success' | 'error' | 'warning' {
    if (outcome === 'SUCCESS') return 'success';
    if (outcome === 'FAILED') return 'error';
    return 'warning';
  }

  statusColor(status?: string | null): 'success' | 'error' | 'warning' | 'processing' | 'default' {
    const normalized = String(status || '').toUpperCase();

    switch (normalized) {
      case 'AUTHORIZED':
      case 'APPROVED':
      case 'SUCCESS':
      case 'COMPLETED':
        return 'success';

      case 'FAILED':
      case 'REJECTED':
      case 'DECLINED':
      case 'ERROR':
        return 'error';

      case 'PROCESSING':
      case 'IN_PROGRESS':
        return 'processing';

      case 'PENDING':
      case 'EXCEPTIONS':
        return 'warning';

      case 'CREATED':
        return 'default';

      default:
        return 'default';
    }
  }

  timelineDotColor(eventStatus: string | null): 'blue' | 'red' | 'green' | 'gray' {
    const status = this.statusColor(eventStatus);

    switch (status) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      case 'warning':
        return 'blue';
      case 'processing':
        return 'blue';
      default:
        return 'gray';
    }
  }

  employeeNumberFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.filteredRows().map((row) => row.employeeNumber))].map((value) => ({ text: value, value }));
  }

  employeeNumberFilterFn = (values: string[], item: BatchRow): boolean => {
    if (!values?.length) return true;
    return values.includes(item.employeeNumber);
  };

  nameFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.filteredRows().map((row) => row.name))].map((value) => ({ text: value, value }));
  }

  nameFilterFn = (values: string[], item: BatchRow): boolean => {
    if (!values?.length) return true;
    return values.includes(item.name);
  };

  emailFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.filteredRows().map((row) => row.email))].map((value) => ({ text: value, value }));
  }

  emailFilterFn = (values: string[], item: BatchRow): boolean => {
    if (!values?.length) return true;
    return values.includes(item.email);
  };

  jobTitleFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.filteredRows().map((row) => row.jobTitle))].map((value) => ({ text: value, value }));
  }

  jobTitleFilterFn = (values: string[], item: BatchRow): boolean => {
    if (!values?.length) return true;
    return values.includes(item.jobTitle);
  };

  outcomeFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.filteredRows().map((row) => row.outcome))].map((value) => ({ text: value, value }));
  }

  outcomeFilterFn = (values: string[], item: BatchRow): boolean => {
    if (!values?.length) return true;
    return values.includes(item.outcome);
  };

  stageFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.filteredRows().map((row) => row.stage))].map((value) => ({ text: value, value }));
  }

  stageFilterFn = (values: string[], item: BatchRow): boolean => {
    if (!values?.length) return true;
    return values.includes(item.stage);
  };

  private exceptionOutcome(ex?: BatchException): RecordOutcome {
    const stage = String(ex?.stage || '').toUpperCase();
    return this.isFailedStage(stage) ? 'FAILED' : 'EXCEPTIONS';
  }

  private isFailedStage(stage: string): boolean {
    return ['FAILED', 'REJECTED', 'DECLINED', 'ERROR'].some((token) => stage.includes(token));
  }

  private toCsv(rows: BatchException[]): string {
    const header = ['Employee Number', 'Exception Message', 'Stage', 'Created On', 'Updated On', 'Sheet Data'];
    const body = rows.map((item) => [
      item.employeeNumber || 'N/A',
      item.exceptionMessage || 'N/A',
      item.stage,
      item.createdOn || '',
      item.updatedOn || '',
      item.sheetDataText || ''
    ]);
    return [header, ...body].map((cols) => cols.map((col) => this.escapeCsv(col)).join(',')).join('\n');
  }

  private escapeCsv(value: string): string {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  }
}
