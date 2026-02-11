import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review360FeedbackRequest {
  reviewerAssignmentId: number;
  employeeId?: number;
  startDoing: string;
  stopDoing: string;
  continueDoing: string;
  maximiseImpact: string;
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class Review360FeedbackService {
  private apiUrl = 'http://localhost:8090/api/review-360-feedback';

  constructor(private http: HttpClient) {}

  submitFeedback(payload: Review360FeedbackRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, payload);
  }
}
