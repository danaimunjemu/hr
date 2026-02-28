import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { OffboardingCase } from '../../models/offboarding-case.model';

@Component({
  selector: 'app-case-header-card',
  standalone: false,
  templateUrl: './case-header-card.component.html',
  styleUrl: './case-header-card.component.scss'
})
export class CaseHeaderCardComponent implements OnChanges {
  @Input({ required: true }) caseData!: OffboardingCase;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['caseData']) {
      this.cdr.detectChanges();
    }
  }

  statusColor(status: string): string {
    const normalized = status.toUpperCase();
    if (normalized === 'COMPLETED') {
      return 'success';
    }
    if (normalized === 'BLOCKED') {
      return 'error';
    }
    if (normalized === 'READY_FOR_COMPLETION') {
      return 'processing';
    }
    if (normalized === 'IN_PROGRESS') {
      return 'warning';
    }
    return 'default';
  }
}
