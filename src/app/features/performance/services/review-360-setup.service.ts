import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review360Setup } from '../models/review-360-setup.model';

@Injectable({
  providedIn: 'root'
})
export class Review360SetupService {
  private apiUrl = 'http://localhost:8090/api/review-360-setup';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Review360Setup[]> {
    return this.http.get<Review360Setup[]>(this.apiUrl);
  }

  createWithReviewers(payload: {
    employeeId: number;
    cycleId: number;
    startDate: string;
    endDate: string;
    anonymous: boolean;
    reviewerIds: number[];
  }): Observable<Review360Setup> {
    return this.http.post<Review360Setup>(`${this.apiUrl}/with-reviewers`, payload);
  }
}
