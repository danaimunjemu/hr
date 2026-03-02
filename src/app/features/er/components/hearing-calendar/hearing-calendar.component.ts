import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ErHearingView } from '../../models/er-hearing.model';

@Component({
  selector: 'app-hearing-calendar',
  standalone: false,
  template: `
    <nz-calendar (nzSelectChange)="onSelect($any($event))">
      <ul *nzDateCell="let date" class="events">
        <li *ngFor="let item of getEvents($any(date))">
          <nz-badge [nzStatus]="getStatus(item)" [nzText]="item.title"></nz-badge>
        </li>
      </ul>
    </nz-calendar>
  `,
  styles: [`
    .events {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .events li {
      margin-bottom: 2px;
    }
  `]
})
export class HearingCalendarComponent {
  @Input() hearingList: ErHearingView[] = [];
  @Output() dateSelected = new EventEmitter<Date>();

  getEvents(date: Date): ErHearingView[] {
    return this.hearingList.filter(h => {
      const hDate = new Date(h.date);
      return hDate.getDate() === date.getDate() &&
        hDate.getMonth() === date.getMonth() &&
        hDate.getFullYear() === date.getFullYear();
    });
  }

  getStatus(hearing: ErHearingView): string {
    switch (hearing.status) {
      case 'OPEN': return hearing.isOverdue ? 'error' : 'warning';
      case 'DONE': return 'success';
      default: return 'default';
    }
  }

  onSelect(date: Date): void {
    this.dateSelected.emit(date);
  }
}
