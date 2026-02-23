import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { OffboardingApprovalStatus, OffboardingRecord } from '../../models/offboarding.model';
import { OffboardingService } from '../../services/offboarding.service';

@Component({
  selector: 'app-offboarding-details-page',
  standalone: false,
  templateUrl: './offboarding-details-page.component.html',
  styleUrl: './offboarding-details-page.component.scss'
})
export class OffboardingDetailsPageComponent implements OnInit {
  readonly nowIso = new Date().toISOString();
  loading = false;
  actionLoading = false;
  record: OffboardingRecord | null = null;
  approvalForm: FormGroup;
  readonly approvalStatusOptions: OffboardingApprovalStatus[] = ['APPROVED', 'REJECTED'];
  approvalModalVisible = false;
  approvalRole: 'HR' | 'HOD' | null = null;
  private id = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private offboardingService: OffboardingService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.approvalForm = this.fb.group({
      approvalStatus: [null, Validators.required],
      comment: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.id) {
      this.router.navigate(['/app/offboarding']);
      return;
    }

    this.load();
  }

  back(): void {
    this.router.navigate(['/app/offboarding']);
  }

  edit(): void {
    if (!this.record || !this.canEdit(this.record)) {
      return;
    }
    this.router.navigate(['/app/offboarding', this.record.id, 'edit']);
  }

  openApprovalModal(role: 'HR' | 'HOD'): void {
    if ((role === 'HR' && !this.canApproveHr()) || (role === 'HOD' && !this.canApproveHod())) {
      return;
    }
    this.approvalRole = role;
    this.approvalForm.reset();
    this.approvalModalVisible = true;
    this.cdr.detectChanges();
  }

  closeApprovalModal(): void {
    if (this.actionLoading) {
      return;
    }
    this.approvalModalVisible = false;
    this.approvalRole = null;
    this.cdr.detectChanges();
  }

  submitApproval(): void {
    if (!this.record || !this.approvalRole || this.approvalForm.invalid || this.actionLoading) {
      this.approvalForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    const { approvalStatus, comment } = this.approvalForm.value;
    this.actionLoading = true;
    this.cdr.detectChanges();

    const approval$ =
      this.approvalRole === 'HR'
        ? this.offboardingService.approveHr(
            this.record.id,
            approvalStatus as OffboardingApprovalStatus,
            String(comment).trim()
          )
        : this.offboardingService.approveHod(
            this.record.id,
            approvalStatus as OffboardingApprovalStatus,
            String(comment).trim()
          );

    approval$
      .pipe(
        finalize(() => {
          this.actionLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.message.success(`${this.approvalRole} decision submitted.`);
          this.closeApprovalModal();
          this.load();
        },
        error: (error: Error) => {
          this.message.error(error.message || `Failed ${this.approvalRole} approval.`);
          this.cdr.detectChanges();
        }
      });
  }

  canApproveHr(): boolean {
    if (!this.record) {
      return false;
    }
    const overall = String(this.record.approvalStatus || '').toUpperCase();
    const hr = String(this.record.hrManagerApprovalStatus || '').toUpperCase();
    if (overall === 'APPROVED' || overall === 'REJECTED') {
      return false;
    }
    if (hr !== 'PENDING') {
      return false;
    }
    return this.hasRole(['HR', 'ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR']);
  }

  canApproveHod(): boolean {
    if (!this.record) {
      return false;
    }
    const overall = String(this.record.approvalStatus || '').toUpperCase();
    const hod = String(this.record.headOfDepartmentApprovalStatus || '').toUpperCase();
    if (overall === 'APPROVED' || overall === 'REJECTED') {
      return false;
    }
    if (hod !== 'PENDING') {
      return false;
    }
    return this.hasRole(['HOD', 'HEAD_OF_DEPARTMENT', 'MANAGER', 'ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR']);
  }

  canEdit(record: OffboardingRecord): boolean {
    return !this.isInApprovalFlow(record.approvalStatus);
  }

  isApprovalFormInvalid(): boolean {
    return this.approvalForm.invalid || this.actionLoading;
  }

  get approvalModalTitle(): string {
    return this.approvalRole ? `Submit ${this.approvalRole} Approval` : 'Submit Approval';
  }

  get timelineEvents(): Array<{ title: string; actor: string; timestamp: string; comment: string; status: string }> {
    if (!this.record) {
      return [];
    }

    const events: Array<{ title: string; actor: string; timestamp: string; comment: string; status: string }> = [
      {
        title: 'Request Created',
        actor: this.record.employeeName || `Employee #${this.record.employeeId}`,
        timestamp: this.record.createdOn || '',
        comment: this.record.notes || this.record.reason || '',
        status: 'APPROVED'
      }
    ];

    if (this.record.headOfDepartmentApprovalStatus) {
      events.push({
        title: 'HOD Decision',
        actor: this.record.headOfDepartmentName || 'Head of Department',
        timestamp: this.record.headOfDepartmentApprovalOn || this.record.updatedOn || '',
        comment: this.record.headOfDepartmentApprovalComment || '',
        status: this.record.headOfDepartmentApprovalStatus
      });
    }

    if (this.record.hrManagerApprovalStatus) {
      events.push({
        title: 'HR Decision',
        actor: this.record.hrManagerName || 'HR Manager',
        timestamp: this.record.hrManagerApprovalOn || this.record.updatedOn || '',
        comment: this.record.hrManagerApprovalComment || '',
        status: this.record.hrManagerApprovalStatus
      });
    }

    if (this.record.updatedOn) {
      events.push({
        title: 'Record Updated',
        actor: 'System',
        timestamp: this.record.updatedOn,
        comment: '',
        status: this.record.approvalStatus
      });
    }

    return events
      .filter(event => event.timestamp)
      .sort(
        (a, b) =>
          new Date(a.timestamp || this.nowIso).getTime() -
          new Date(b.timestamp || this.nowIso).getTime()
      );
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

  private load(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.offboardingService
      .getById(this.id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: record => {
          this.record = record;
          this.cdr.detectChanges();
        },
        error: (error: Error) => {
          this.message.error(error.message || 'Failed to load offboarding details.');
          this.router.navigate(['/app/offboarding']);
          this.cdr.detectChanges();
        }
      });
  }

  private hasRole(expectedRoles: string[]): boolean {
    const roles = this.getUserRoles();
    if (roles.length === 0) {
      return true;
    }
    return roles.some(role => expectedRoles.includes(role));
  }

  private getUserRoles(): string[] {
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) {
        return [];
      }

      const parsedUser = JSON.parse(rawUser) as Record<string, unknown>;
      const rawRoles = (parsedUser['roles'] as unknown[]) || [];
      return rawRoles
        .map(role => {
          if (typeof role === 'string') {
            return role;
          }
          if (role && typeof role === 'object' && 'name' in role) {
            return String((role as { name: unknown }).name);
          }
          return '';
        })
        .filter(role => role)
        .map(role => role.toUpperCase());
    } catch {
      return [];
    }
  }

  private isInApprovalFlow(status: string): boolean {
    return String(status || '').toUpperCase().startsWith('PENDING');
  }
}
