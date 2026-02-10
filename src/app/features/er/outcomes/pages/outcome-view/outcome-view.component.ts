import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErOutcomeService } from '../../services/er-outcome.service';
import { ErOutcome } from '../../models/er-outcome.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-outcome-view',
  standalone: false,
  template: `
    <div class="page-header">
      <nz-page-header (nzBack)="onBack()" nzBackIcon nzTitle="Outcome Details">
        <nz-page-header-extra>
          <button nz-button nzType="primary" [routerLink]="['../../edit', outcome?.id]">Update Communication</button>
        </nz-page-header-extra>
      </nz-page-header>
    </div>

    <nz-spin [nzSpinning]="loading">
      <div *ngIf="outcome">
        <nz-card nzTitle="Decision" class="mb-4">
          <nz-descriptions [nzColumn]="2" nzBordered>
            <nz-descriptions-item nzTitle="Linked Case">
              <a [routerLink]="['/er/cases/view', outcome!.erCase.id]">
                {{ outcome!.erCase.caseNumber || 'Case #' + outcome!.erCase.id }}
              </a>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Outcome Type">
              <nz-tag>{{ outcome!.outcomeType }}</nz-tag>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Decided By">
              {{ outcome!.decidedBy.firstName }} {{ outcome!.decidedBy.lastName }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Decision Date">{{ outcome!.decisionAt | date:'medium' }}</nz-descriptions-item>
          </nz-descriptions>
        </nz-card>

        <nz-card nzTitle="Details" class="mb-4">
          <h4 class="font-bold mb-2">Decision Summary</h4>
          <p class="mb-4">{{ outcome!.decisionSummary }}</p>
          
          <h4 class="font-bold mb-2">Action Taken</h4>
          <p>{{ outcome!.actionTaken }}</p>
        </nz-card>

        <nz-card nzTitle="Communication">
          <nz-descriptions [nzColumn]="1" nzBordered>
            <nz-descriptions-item nzTitle="Communicated At">
              {{ (outcome!.communicatedAt | date:'medium') || 'Not yet communicated' }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Notes">
              {{ outcome!.communicationNotes || 'No notes available.' }}
            </nz-descriptions-item>
          </nz-descriptions>
        </nz-card>
      </div>
    </nz-spin>
  `,
  styles: [`
    .mb-4 { margin-bottom: 16px; }
  `]
})
export class OutcomeViewComponent implements OnInit {
  outcome: ErOutcome | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private outcomeService: ErOutcomeService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadOutcome(id);
    }
  }

  loadOutcome(id: number): void {
    this.loading = true;
    this.outcomeService.getOutcome(id).subscribe({
      next: (data) => {
        this.outcome = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load outcome');
        this.loading = false;
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
