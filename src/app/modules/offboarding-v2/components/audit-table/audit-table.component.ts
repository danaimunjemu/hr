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
}
