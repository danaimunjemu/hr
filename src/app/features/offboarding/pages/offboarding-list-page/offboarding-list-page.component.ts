import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { OffboardingRecord } from '../../models/offboarding.model';
import { OffboardingService } from '../../services/offboarding.service';

@Component({
  selector: 'app-offboarding-list-page',
  standalone: false,
  templateUrl: './offboarding-list-page.component.html',
  styleUrl: './offboarding-list-page.component.scss'
})
export class OffboardingListPageComponent implements OnInit {
  loading = false;
  actionLoadingId: number | null = null;
  records: OffboardingRecord[] = [];
  filteredRecords: OffboardingRecord[] = [];
  searchTerm = '';

  constructor(
    private offboardingService: OffboardingService,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    this.offboardingService
      .getAll()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: records => {
          this.records = records;
          this.applyClientFilters();
        },
        error: (error: Error) => {
          this.message.error(error.message || 'Failed to load offboarding records.');
        }
      });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyClientFilters();
  }

  applyClientFilters(): void {
    const query = this.searchTerm.trim().toLowerCase();

    this.filteredRecords = this.records.filter(record => {
      const haystack = [
        this.employeeLabel(record),
        this.employeeNumberLabel(record),
        String(record.offboardingType || '-'),
        String(record.approvalStatus || '-'),
        this.lastWorkingDayValue(record)
      ]
        .join(' ')
        .toLowerCase();

      return !query || haystack.includes(query);
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.applyClientFilters();
  }

  view(record: OffboardingRecord): void {
    this.router.navigate(['/app/offboarding', record.id]);
  }

  edit(record: OffboardingRecord): void {
    if (!this.canEdit(record)) {
      return;
    }
    this.router.navigate(['/app/offboarding', record.id, 'edit']);
  }

  remove(record: OffboardingRecord): void {
    this.actionLoadingId = record.id;

    this.offboardingService
      .delete(record.id)
      .pipe(
        finalize(() => {
          this.actionLoadingId = null;
        })
      )
      .subscribe({
        next: () => {
          this.message.success('Offboarding record deleted.');
          this.loadRecords();
        },
        error: (error: Error) => {
          this.message.error(error.message || 'Failed to delete offboarding record.');
        }
      });
  }

  canEdit(record: OffboardingRecord): boolean {
    return !this.isInApprovalFlow(record.approvalStatus);
  }

  statusColor(status: string): string {
    const normalized = String(status || '').toUpperCase();
    if (normalized === 'APPROVED' || normalized === 'COMPLETED') {
      return 'success';
    }
    if (normalized === 'REJECTED' || normalized === 'DECLINED') {
      return 'error';
    }
    if (normalized.startsWith('PENDING')) {
      return 'warning';
    }
    return 'default';
  }

  employeeLabel(record: OffboardingRecord): string {
    return record.employeeName?.trim() || `Employee #${record.employeeId}`;
  }

  employeeNumberLabel(record: OffboardingRecord): string {
    return record.employeeNumber?.trim() || `ID: ${record.employeeId}`;
  }

  employeeFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.records.map(record => this.employeeLabel(record)))].map(value => ({
      text: value,
      value
    }));
  }

  employeeFilterFn = (values: string[], item: OffboardingRecord): boolean => {
    if (!values?.length) return true;
    return values.includes(this.employeeLabel(item));
  };

  employeeSortFn = (a: OffboardingRecord, b: OffboardingRecord): number =>
    this.employeeLabel(a).localeCompare(this.employeeLabel(b));

  typeFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.records.map(record => String(record.offboardingType || '-')))].map(value => ({
      text: this.toDisplayText(value),
      value
    }));
  }

  typeFilterFn = (values: string[], item: OffboardingRecord): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.offboardingType || '-'));
  };

  typeSortFn = (a: OffboardingRecord, b: OffboardingRecord): number =>
    String(a.offboardingType || '-').localeCompare(String(b.offboardingType || '-'));

  lastWorkingDayFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.records.map(record => this.lastWorkingDayValue(record)))].map(value => ({
      text: value,
      value
    }));
  }

  lastWorkingDayFilterFn = (values: string[], item: OffboardingRecord): boolean => {
    if (!values?.length) return true;
    return values.includes(this.lastWorkingDayValue(item));
  };

  lastWorkingDaySortFn = (a: OffboardingRecord, b: OffboardingRecord): number =>
    new Date(a.lastWorkingDay || 0).getTime() - new Date(b.lastWorkingDay || 0).getTime();

  statusFilters(): Array<{ text: string; value: string }> {
    return [...new Set(this.records.map(record => String(record.approvalStatus || '-')))].map(value => ({
      text: this.toDisplayText(value),
      value
    }));
  }

  statusFilterFn = (values: string[], item: OffboardingRecord): boolean => {
    if (!values?.length) return true;
    return values.includes(String(item.approvalStatus || '-'));
  };

  statusSortFn = (a: OffboardingRecord, b: OffboardingRecord): number =>
    String(a.approvalStatus || '-').localeCompare(String(b.approvalStatus || '-'));

  private lastWorkingDayValue(record: OffboardingRecord): string {
    if (!record.lastWorkingDay) {
      return '-';
    }
    return record.lastWorkingDay.slice(0, 10);
  }

  private isInApprovalFlow(status: string): boolean {
    return String(status || '').toUpperCase().startsWith('PENDING');
  }

  private toDisplayText(value: string): string {
    const normalized = String(value || '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    if (!normalized) {
      return '';
    }
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
}
