import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { OffboardingEvent } from '../../models/offboarding-event.model';

@Component({
  selector: 'app-audit-table',
  standalone: false,
  templateUrl: './audit-table.component.html',
  styleUrl: './audit-table.component.scss'
})
export class AuditTableComponent implements OnChanges {
  @Input() events: OffboardingEvent[] = [];

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.cdr.detectChanges();
    }
  }

  displayOccurredAt(event: OffboardingEvent): string {
    return event.occurredAt || event.timestamp;
  }

  displayEventType(event: OffboardingEvent): string {
    return event.eventType || event.action || '-';
  }

  displayDescription(event: OffboardingEvent): string {
    return event.description || event.notes || '-';
  }

  displayPerformedBy(event: OffboardingEvent): string {
    const firstName = event.performedBy?.firstName?.trim() || '';
    const lastName = event.performedBy?.lastName?.trim() || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || event.actor || '-';
  }
}
