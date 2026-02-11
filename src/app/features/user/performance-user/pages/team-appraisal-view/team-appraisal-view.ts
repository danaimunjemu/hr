import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Appraisal, AppraisalItem } from '../../models/appraisal.model';
import { AppraisalService } from '../../services/appraisal.service';
import { NzMessageService } from 'ng-zorro-antd/message';

interface EditItemData {
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-team-appraisal-view',
  standalone: false,
  templateUrl: './team-appraisal-view.html',
  styleUrls: ['./team-appraisal-view.scss']
})
export class TeamAppraisalViewComponent implements OnInit {
  appraisal: WritableSignal<Appraisal | null> = signal(null);
  loading: WritableSignal<boolean> = signal(true);
  savingItemId: WritableSignal<number | null> = signal(null);
  editingItemId: WritableSignal<number | null> = signal(null);
  submitting: WritableSignal<boolean> = signal(false);

  editData: WritableSignal<{ [key: number]: EditItemData }> = signal({});

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appraisalService: AppraisalService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadAppraisal(id);
      }
    });
  }

  loadAppraisal(id: number): void {
    this.loading.set(true);
    this.appraisalService.getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.appraisal.set(data),
        error: (err: any) => {
          this.message.error('Failed to load appraisal details');
          this.router.navigate(['/app/performance-user/team-appraisals']);
        }
      });
  }

  startEdit(item: AppraisalItem): void {
    this.editingItemId.set(item.id);
    const currentData = this.editData();
    this.editData.set({
      ...currentData,
      [item.id]: {
        rating: item.managerRating || 0,
        comment: item.managerComment || ''
      }
    });
  }

  cancelEdit(): void {
    this.editingItemId.set(null);
  }

  saveItem(item: AppraisalItem): void {
    const appraisalData = this.appraisal();
    if (!appraisalData) return;

    const itemData = this.editData()[item.id];
    if (!itemData) return;

    if (!itemData.rating || itemData.rating === 0) {
      this.message.error('Please provide a rating');
      return;
    }

    if (!itemData.comment || itemData.comment.trim() === '') {
      this.message.error('Please provide a comment');
      return;
    }

    this.savingItemId.set(item.id);
    this.appraisalService.managerRate({
      appraisalItemId: item.id,
      rating: itemData.rating,
      comment: itemData.comment
    })
      .pipe(finalize(() => this.savingItemId.set(null)))
      .subscribe({
        next: () => {
          this.message.success('Manager rating saved successfully');
          this.editingItemId.set(null);
          this.loadAppraisal(appraisalData.id);
        },
        error: () => {
          this.message.error('Failed to save manager rating');
        }
      });
  }

  updateEditData(itemId: number, field: keyof EditItemData, value: any): void {
    const currentData = this.editData();
    this.editData.set({
      ...currentData,
      [itemId]: {
        ...currentData[itemId],
        [field]: value
      }
    });
  }

  canSubmitAppraisal(): boolean {
    const appraisalData = this.appraisal();
    if (!appraisalData || appraisalData.status !== 'SUBMITTED') return false;

    return appraisalData.appraisalItems.every(item =>
      item.managerRating !== null && item.managerComment !== null
    );
  }

  submitAppraisal(): void {
    const appraisalData = this.appraisal();
    if (!appraisalData) return;

    if (!this.canSubmitAppraisal()) {
      this.message.error('Please rate all appraisal items before submitting');
      return;
    }

    this.submitting.set(true);
    this.appraisalService.managerSubmitAppraisal(appraisalData.id)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Appraisal submitted successfully');
          this.router.navigate(['/app/performance-user/team-appraisals']);
        },
        error: () => {
          this.message.error('Failed to submit appraisal');
        }
      });
  }

  onBack(): void {
    this.router.navigate(['/app/performance-user/team-appraisals']);
  }

  getEmployeeName(): string {
    const appraisalData = this.appraisal();
    if (!appraisalData) return '-';
    if (appraisalData.employee?.firstName && appraisalData.employee?.lastName) {
      return `${appraisalData.employee.firstName} ${appraisalData.employee.lastName}`;
    }
    return appraisalData.employee?.employeeNumber || '-';
  }

  getManagerName(): string {
    const appraisalData = this.appraisal();
    if (!appraisalData) return '-';
    if (appraisalData.manager?.firstName && appraisalData.manager?.lastName) {
      return `${appraisalData.manager.firstName} ${appraisalData.manager.lastName}`;
    }
    return appraisalData.manager?.employeeNumber || '-';
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'DRAFT': 'default',
      'SUBMITTED': 'blue',
      'COMPLETED': 'green'
    };
    return statusColors[status] || 'default';
  }

  isEditing(itemId: number): boolean {
    return this.editingItemId() === itemId;
  }

  isSaving(itemId: number): boolean {
    return this.savingItemId() === itemId;
  }
}
