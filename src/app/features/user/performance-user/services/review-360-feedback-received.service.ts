import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review360FeedbackReceived } from '../models/review-360-feedback.model';

@Injectable({
  providedIn: 'root'
})
export class Review360FeedbackReceivedService {
  private apiUrl = 'http://localhost:8090/api/review-360-feedback';

  constructor(private http: HttpClient) {}

  getMyReceivedFeedback(): Observable<Review360FeedbackReceived[]> {
    return this.http.get<Review360FeedbackReceived[]>(`${this.apiUrl}/my-received-feedback`);
  }
}
