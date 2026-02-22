import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

  filters = {
    employee: '',
    status: '',
    date: null as Date | null
  };

  statuses: string[] = [];

  constructor(
    private offboardingService: OffboardingService,
    private message: NzMessageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.resolveListObservable()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: records => {
          this.records = records;
          this.statuses = Array.from(
            new Set(
              records
                .map(record => String(record.approvalStatus || '').toUpperCase())
                .filter(Boolean)
            )
          );
          this.applyClientFilters();
          this.cdr.detectChanges();
        },
        error: (error: Error) => {
          this.message.error(error.message || 'Failed to load offboarding records.');
          this.cdr.detectChanges();
        }
      });
  }

  applyClientFilters(): void {
    const employeeText = this.filters.employee.trim().toLowerCase();
    const status = this.filters.status.trim().toUpperCase();
    const date = this.filters.date ? this.toIsoDate(this.filters.date) : '';

    this.filteredRecords = this.records.filter(record => {
      const haystack = `${record.employeeName || ''} ${record.employeeNumber || ''} ${
        record.employeeId
      }`.toLowerCase();
      const matchesEmployee = !employeeText || haystack.includes(employeeText);
      const matchesStatus =
        !status || String(record.approvalStatus || '').toUpperCase() === status;
      const matchesDate =
        !date || (record.lastWorkingDay || '').slice(0, 10) === date;
      return matchesEmployee && matchesStatus && matchesDate;
    });

    this.cdr.detectChanges();
  }

  resetFilters(): void {
    this.filters = {
      employee: '',
      status: '',
      date: null
    };
    this.cdr.detectChanges();
    this.loadRecords();
  }

  view(record: OffboardingRecord): void {
    this.router.navigate(['/app/offboarding', record.id]);
    this.cdr.detectChanges();
  }

  edit(record: OffboardingRecord): void {
    if (!this.canEdit(record)) {
      return;
    }
    this.router.navigate(['/app/offboarding', record.id, 'edit']);
    this.cdr.detectChanges();
  }

  remove(record: OffboardingRecord): void {
    this.actionLoadingId = record.id;
    this.cdr.detectChanges();

    this.offboardingService
      .delete(record.id)
      .pipe(
        finalize(() => {
          this.actionLoadingId = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.message.success('Offboarding record deleted.');
          this.loadRecords();
        },
        error: (error: Error) => {
          this.message.error(error.message || 'Failed to delete offboarding record.');
          this.cdr.detectChanges();
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

  private resolveListObservable() {
    const employeeFilter = this.filters.employee.trim();
    const employeeId = Number(employeeFilter);
    if (employeeFilter && !Number.isNaN(employeeId) && employeeId > 0) {
      return this.offboardingService.getByEmployeeId(employeeId);
    }
    return this.offboardingService.getAll();
  }

  private toIsoDate(date: Date): string {
    return new Date(date).toISOString().slice(0, 10);
  }

  private isInApprovalFlow(status: string): boolean {
    return String(status || '').toUpperCase().startsWith('PENDING');
  }
}
