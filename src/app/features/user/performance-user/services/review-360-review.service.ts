import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review360Review } from '../models/review-360-review.model';

@Injectable({
  providedIn: 'root'
})
export class Review360ReviewService {
  private apiUrl = 'http://localhost:8090/api/review-360-reviewer';

  constructor(private http: HttpClient) {}

  getMyReviews(): Observable<Review360Review[]> {
    return this.http.get<Review360Review[]>(`${this.apiUrl}/my-reviews`);
  }
}
