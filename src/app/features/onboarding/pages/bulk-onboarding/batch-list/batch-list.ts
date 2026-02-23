import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, computed, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Batch, BatchStatus, BatchService } from '../../../services/bulk-onboarding';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-batch-list',
  standalone: false,
  templateUrl: './batch-list.html',
  styleUrl: './batch-list.scss',
})
export class BatchList implements OnInit {
  private _loading = signal(false);
  private _batches = signal<Batch[]>([]);
  private _statusFilter = signal<BatchStatus | 'ALL'>('ALL');
  private _searchTerm = signal('');

  // modal visibility (plain boolean)
  newBatchVisible = false;

  fileList: NzUploadFile[] = [];
  private rawFile: File | null = null;
  submitting = false;

  loading = computed(() => this._loading());
  batches = computed(() => this._batches());
  statusFilter = computed(() => this._statusFilter());
  searchTerm = computed(() => this._searchTerm());

  filteredBatches = computed(() => {
    const query = this._searchTerm().trim().toLowerCase();
    if (!query) {
      return this._batches();
    }

    return this._batches().filter((batch) => {
      const name = String(batch.name ?? '').toLowerCase();
      const created = this.createdDisplay(batch).toLowerCase();
      const inputter = String(batch.inputter ?? '').toLowerCase();
      const status = String(batch.status ?? '').toLowerCase();
      const records = String(batch.employees?.length ?? 0);

      return (
        name.includes(query) ||
        created.includes(query) ||
        inputter.includes(query) ||
        status.includes(query) ||
        records.includes(query)
      );
    });
  });

  constructor(
    private batchService: BatchService,
    private message: NzMessageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  // ------------ modal / new batch ------------

  newBatch(): void {
    this.newBatchVisible = true;
  }

  closeNewBatch(): void {
    this.newBatchVisible = false;
  }

  onBatchCreated(): void {
    this.newBatchVisible = false;
    this.load(); 
  }

 downloadSampleTemplate(): void {
  const url = 'assets/bulk-onboarding/Employee_Bulk_Upload_Sample file.xlsx';
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Employee_Bulk_Upload_Sample file.xlsx';
  a.click();
}


  beforeUpload = (file: NzUploadFile | any): boolean => {
    this.rawFile = file as File;
    this.fileList = [file as NzUploadFile];
    return false;
  };

  handleChange(info: NzUploadChangeParam): void {
    if (info.file.status === 'error') {
      this.message.error('File upload failed.');
    }
  }

  submit(): void {
    if (!this.rawFile || this.submitting) return;

    const formData = new FormData();
    formData.append('file', this.rawFile);

    this.submitting = true;
    this.batchService.upload(formData).subscribe({
      next: (batch) => {
        this.submitting = false;
        this.message.success('Bulk onboarding batch created.');
        this.cdr.detectChanges();
        // If you want to stay on list and refresh instead, call onBatchCreated()
        this.router.navigate(['/app/onboarding/batches', batch.id]);
      },
      error: (err) => {
        this.submitting = false;
        const msg = err?.error?.message || 'Failed to create bulk onboarding batch.';
        this.message.error(msg);
        this.cdr.detectChanges();
      }
    });
  }

  goToBatches(): void {
    this.router.navigate(['/app/onboarding/batches']);
  }

  back(): void {
    this.goToBatches();
  }

  // ------------ list + filters ------------

  load(): void {
    this._loading.set(true);
    const status = this._statusFilter();
    const obs =
      status === 'ALL'
        ? this.batchService.list()
        : this.batchService.findByStatus(status as BatchStatus);

    obs.subscribe({
      next: (batches) => {
        this._loading.set(false);
        this._batches.set(batches);
      },
      error: (err) => {
        this._loading.set(false);
        const msg = err?.error?.message || 'Failed to load batches.';
        this.message.error(msg);
      },
    });
  }

  onStatusFilterChange(status: BatchStatus | 'ALL'): void {
    this._statusFilter.set(status);
    this.load();
  }

  onSearch(term: string): void {
    this._searchTerm.set(term);
  }

  resetFilters(): void {
    this._searchTerm.set('');
  }

  view(batch: Batch): void {
    this.router.navigate(['/app/onboarding/batches', batch.id]);
  }

  statusColor(status?: string | null): string {
    switch (status) {
      case 'PENDING':
      case 'UN_APPROVED':
      case 'UN_AUTHORISED':
        return 'warning';
      case 'FORMATTING':
      case 'IN_PROGRESS':
        return 'processing';
      case 'COMPLETED':
      case 'AUTHORISED':
        return 'success';
      case 'EXPIRED':
      case 'DECLINED':
        return 'error';
      default:
        return 'default';
    }
  }

  createdDisplay(batch: Batch): string {
    if (!batch.inputDateTime) {
      return '-';
    }
    return formatDate(batch.inputDateTime, 'short', 'en-US');
  }

  // ------------ column filters ------------

  batchNameFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this._batches().map((batch) => String(batch.name ?? '-')))]
      .map((value) => ({ text: value, value }));
  }

  batchNameFilterFn = (values: string[], item: Batch): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.name ?? '-'));
  };

  createdFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this._batches().map((batch) => this.createdDisplay(batch)))]
      .map((value) => ({ text: value, value }));
  }

  createdFilterFn = (values: string[], item: Batch): boolean => {
    if (!values?.length) return true;
    return values.includes(this.createdDisplay(item));
  };

  inputterFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this._batches().map((batch) => String(batch.inputter ?? '-')))]
      .map((value) => ({ text: value, value }));
  }

  inputterFilterFn = (values: string[], item: Batch): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.inputter ?? '-'));
  };

  statusFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this._batches().map((batch) => String(batch.status ?? '-')))]
      .map((value) => ({ text: value, value }));
  }

  statusFilterFn = (values: string[], item: Batch): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.status ?? '-'));
  };

  recordsFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this._batches().map((batch) => String(batch.employees?.length ?? 0)))]
      .map((value) => ({ text: value, value }));
  }

  recordsFilterFn = (values: string[], item: Batch): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.employees?.length ?? 0));
  };
}
