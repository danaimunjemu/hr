import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HolidayCalendar, HolidayDate } from '../models/holiday-calendar.model';

@Injectable({
  providedIn: 'root'
})
export class HolidayCalendarService {
  private readonly apiUrl = 'http://localhost:8090/api/holiday-calendars';
  private readonly dateUrl = 'http://localhost:8090/api/holiday-dates';

  constructor(private http: HttpClient) {}

  getAll(): Observable<HolidayCalendar[]> {
    return this.http.get<HolidayCalendar[]>(this.apiUrl);
  }

  getById(id: number): Observable<HolidayCalendar> {
    return this.http.get<HolidayCalendar>(`${this.apiUrl}/${id}`);
  }

  create(calendar: HolidayCalendar): Observable<HolidayCalendar> {
    return this.http.post<HolidayCalendar>(this.apiUrl, calendar);
  }

  update(id: number, calendar: HolidayCalendar): Observable<HolidayCalendar> {
    return this.http.put<HolidayCalendar>(`${this.apiUrl}/${id}`, calendar);
  }

  // Holiday Dates
  addDate(date: HolidayDate): Observable<HolidayDate> {
    return this.http.post<HolidayDate>(this.dateUrl, date);
  }

  updateDate(id: number, date: HolidayDate): Observable<HolidayDate> {
    return this.http.put<HolidayDate>(`${this.dateUrl}/${id}`, date);
  }

  deleteDate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.dateUrl}/${id}`);
  }
}
