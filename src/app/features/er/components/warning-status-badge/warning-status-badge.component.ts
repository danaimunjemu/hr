import { Component, Input, computed } from '@angular/core';

@Component({
  selector: 'app-warning-status-badge',
  standalone: false,
  template: `
    <nz-tag [nzColor]="color()">
      {{ status }}
    </nz-tag>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class WarningStatusBadgeComponent {
  @Input({ required: true }) status!: string;

  color = computed(() => {
    const s = this.status?.toUpperCase();
    switch (s) {
      case 'ACTIVE': return 'processing';
      case 'EXPIRED': return 'default';
      case 'RESOLVED': return 'success';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  });
}
