import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { finalize } from 'rxjs';
import { Review360FeedbackReceived } from '../../models/review-360-feedback.model';
import { Review360FeedbackReceivedService } from '../../services/review-360-feedback-received.service';

@Component({
  selector: 'app-review-360-feedback-list',
  standalone: false,
  templateUrl: './review-360-feedback-list.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class Review360FeedbackListComponent implements OnInit {
  loading: WritableSignal<boolean> = signal(true);
  feedbacks: WritableSignal<Review360FeedbackReceived[]> = signal([]);

  constructor(private feedbackService: Review360FeedbackReceivedService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.feedbackService.getMyReceivedFeedback()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.feedbacks.set(data),
        error: (err: any) => console.error('Failed to load 360 feedback', err)
      });
  }

  getReviewerName(item: Review360FeedbackReceived): string {
    const anonymous = item.reviewer?.setup?.anonymous;
    if (anonymous) {
      return 'Anonymous';
    }
    const reviewer = item.reviewer?.reviewer;
    if (reviewer?.firstName && reviewer?.lastName) {
      return `${reviewer.firstName} ${reviewer.lastName}`;
    }
    return reviewer?.employeeNumber || '-';
  }

  isAnonymous(item: Review360FeedbackReceived): boolean {
    return !!item.reviewer?.setup?.anonymous;
  }
}
