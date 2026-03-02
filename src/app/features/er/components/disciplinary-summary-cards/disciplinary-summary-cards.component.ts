import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-disciplinary-summary-cards',
    standalone: false,
    template: `
    <div nz-row [nzGutter]="16">
      <div nz-col [nzSpan]="6">
        <nz-card>
          <nz-statistic [nzValue]="summary?.totalCases" nzTitle="Total Cases" [nzPrefix]="prefixTemplateCases"></nz-statistic>
          <ng-template #prefixTemplateCases><i nz-icon nzType="folder-open"></i></ng-template>
        </nz-card>
      </div>
      <div nz-col [nzSpan]="6">
        <nz-card>
          <nz-statistic [nzValue]="summary?.warningsIssued" nzTitle="Warnings Issued" [nzPrefix]="prefixTemplateWarnings" [nzValueStyle]="{ color: '#faad14' }"></nz-statistic>
          <ng-template #prefixTemplateWarnings><i nz-icon nzType="warning"></i></ng-template>
        </nz-card>
      </div>
      <div nz-col [nzSpan]="6">
        <nz-card>
          <nz-statistic [nzValue]="summary?.dismissals" nzTitle="Dismissals" [nzPrefix]="prefixTemplateDismissals" [nzValueStyle]="{ color: '#ff4d4f' }"></nz-statistic>
          <ng-template #prefixTemplateDismissals><i nz-icon nzType="stop"></i></ng-template>
        </nz-card>
      </div>
      <div nz-col [nzSpan]="6">
        <nz-card>
          <nz-statistic [nzValue]="85" nzTitle="Resolution Rate" nzSuffix="%" [nzPrefix]="prefixTemplateRate" [nzValueStyle]="{ color: '#52c41a' }"></nz-statistic>
          <ng-template #prefixTemplateRate><i nz-icon nzType="check-circle"></i></ng-template>
        </nz-card>
      </div>
    </div>
  `
})
export class DisciplinarySummaryCardsComponent {
    @Input() summary: any;
}
