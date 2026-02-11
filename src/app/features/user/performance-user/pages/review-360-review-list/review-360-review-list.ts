import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Review360Review } from '../../models/review-360-review.model';
import { Review360ReviewService } from '../../services/review-360-review.service';
import { Review360FeedbackService } from '../../services/review-360-feedback.service';
import { NzMessageService } from 'ng-zorro-antd/message';


@Component({
  selector: 'app-review-360-review-list',
  standalone: false,
  templateUrl: './review-360-review-list.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class Review360ReviewListComponent implements OnInit {
  form: FormGroup;
  loading: WritableSignal<boolean> = signal(true);
  reviews: WritableSignal<Review360Review[]> = signal([]);
  submitting: WritableSignal<boolean> = signal(false);
  isFeedbackModalVisible: WritableSignal<boolean> = signal(false);
  selectedReview: WritableSignal<Review360Review | null> = signal(null);

  constructor(
    private fb: FormBuilder,
    private review360ReviewService: Review360ReviewService,
    private review360FeedbackService: Review360FeedbackService,
    private message: NzMessageService,
  ) {
    this.form = this.fb.group({
      startDoing: ['', [Validators.required]],
      stopDoing: ['', [Validators.required]],
      continueDoing: ['', [Validators.required]],
      maximiseImpact: ['', [Validators.required]],
      rating: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.review360ReviewService.getMyReviews()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.reviews.set(data),
        error: (err: any) => console.error('Failed to load 360 reviews', err)
      });
  }

  getReviewerName(review: Review360Review): string {
    if (review.reviewer?.firstName && review.reviewer?.lastName) {
      return `${review.reviewer.firstName} ${review.reviewer.lastName}`;
    }
    return review.reviewer?.employeeNumber || '-';
  }

  getStatusColor(completed: boolean): string {
    return completed ? 'green' : 'blue';
  }

  getFeedbackCount(review: Review360Review): number {
    return review.feedback?.length || 0;
  }

  openFeedbackModal(review: Review360Review): void {
    this.selectedReview.set(review);
    this.form.reset({
      startDoing: '',
      stopDoing: '',
      continueDoing: '',
      maximiseImpact: '',
      rating: null
    });
    this.isFeedbackModalVisible.set(true);
  }

  closeFeedbackModal(): void {
    this.isFeedbackModalVisible.set(false);
  }

  submitFeedback(): void {
    if (this.form.invalid || !this.selectedReview()) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const review = this.selectedReview();
    if (!review) {
      return;
    }

    const formValue = this.form.value;
    const employeeId = this.getLoggedInEmployeeId();
    if (!employeeId) {
      this.message.error('Failed to determine logged in employee');
      return;
    }
    const payload = {
      employeeId: employeeId,
      reviewerAssignmentId: review.id,
      startDoing: formValue.startDoing,
      stopDoing: formValue.stopDoing,
      continueDoing: formValue.continueDoing,
      maximiseImpact: formValue.maximiseImpact,
      rating: formValue.rating
    };

    this.submitting.set(true);
    this.review360FeedbackService.submitFeedback(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.message.success('Feedback submitted successfully');
          this.closeFeedbackModal();
          this.loadData();
        },
        error: () => this.message.error('Failed to submit feedback')
      });
  }

  getLoggedInEmployeeId(): number | null {
    const user =this.getStoredUser();
    return user?.employee?.id;
  }

  private getStoredUser(): any | null {
    const stored = localStorage.getItem('user');
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
}
