import { Component, OnInit, signal, computed } from '@angular/core';
import { ErCaseService } from '../../services/er-case.service';
import { ErHearingView, extractHearingsFromCase } from '../../models/er-hearing.model';

@Component({
  selector: 'app-hearings-calendar-page',
  standalone: false,
  template: `
    <div class="p-6">
      <nz-page-header nzTitle="Hearing & Case Calendar">
        <nz-page-header-extra>
          <button nz-button nzType="default">Sync Calendar</button>
        </nz-page-header-extra>
      </nz-page-header>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="16">
          <nz-card>
            <app-hearing-calendar 
              [hearingList]="allHearings()" 
              (dateSelected)="onDateSelect($event)">
            </app-hearing-calendar>
          </nz-card>
        </div>
        <div nz-col [nzSpan]="8">
          <nz-card nzTitle="Upcoming Hearings">
            <nz-list [nzDataSource]="upcomingHearings()" nzBordered>
              <nz-list-item *ngFor="let item of upcomingHearings()">
                <nz-list-item-meta
                  [nzTitle]="item.title"
                  [nzDescription]="(item.date | date:'medium') + ' - ' + item.employeeName"
                ></nz-list-item-meta>
                <ul nz-list-item-actions>
                  <nz-list-item-action>
                    <nz-badge *ngIf="item.isOverdue" nzStatus="error" nzText="Overdue"></nz-badge>
                  </nz-list-item-action>
                </ul>
              </nz-list-item>
              <nz-empty *ngIf="upcomingHearings().length === 0" nzNotFoundContent="No upcoming hearings"></nz-empty>
            </nz-list>
          </nz-card>
        </div>
      </div>
    </div>
  `
})
export class HearingsCalendarPage implements OnInit {
  allHearings = signal<ErHearingView[]>([]);
  selectedDate = signal<Date | null>(null);

  upcomingHearings = computed(() => {
    return this.allHearings()
      .filter(h => h.status === 'OPEN')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  constructor(private erCaseService: ErCaseService) { }

  ngOnInit(): void {
    this.loadHearings();
  }

  loadHearings(): void {
    this.erCaseService.getDisciplinaryCases().subscribe(cases => {
      const hearings: ErHearingView[] = [];
      cases.forEach(c => {
        hearings.push(...extractHearingsFromCase(c));
      });
      this.allHearings.set(hearings);
    });
  }

  onDateSelect(date: Date): void {
    this.selectedDate.set(date);
  }
}
