import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErIntakeService } from '../../services/er-intake.service';
import { ErIntake } from '../../models/er-intake.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-intake-view',
  standalone: false,
  template: `
    <div class="page-header">
      <nz-page-header (nzBack)="onBack()" nzBackIcon nzTitle="Intake Details">
        <nz-page-header-extra>
          <button nz-button nzType="primary" [routerLink]="['../../edit', intake()?.id]">Edit Triage</button>
        </nz-page-header-extra>
      </nz-page-header>
    </div>

    <nz-spin [nzSpinning]="loading()">
      <div *ngIf="intake() as intake">
        <nz-card nzTitle="Incident Details" class="mb-4">
          <nz-descriptions [nzColumn]="2" nzBordered>
            <nz-descriptions-item nzTitle="Linked Case">
              <a [routerLink]="['/er/cases/view', intake.erCase.id]">
                {{ intake.erCase.caseNumber || 'Case #' + intake.erCase.id }}
              </a>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Logged By">
              {{ intake.loggedBy.firstName }} {{ intake.loggedBy.lastName }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Incident Date From">{{ intake.incidentDateFrom | date:'medium' }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Incident Date To">{{ (intake.incidentDateTo | date:'medium') || 'N/A' }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Location">{{ intake.incidentLocation }}</nz-descriptions-item>
          </nz-descriptions>
        </nz-card>

        <nz-card nzTitle="Description" class="mb-4">
          <p class="whitespace-pre-wrap">{{ intake.detailedDescription }}</p>
        </nz-card>

        <nz-card nzTitle="Triage Decision">
          <nz-descriptions [nzColumn]="1" nzBordered>
            <nz-descriptions-item nzTitle="Decision">
              <nz-tag>{{ intake.triageDecision || 'PENDING' }}</nz-tag>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Notes">
              {{ intake.triageNotes || 'No notes available.' }}
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
export class IntakeViewComponent implements OnInit {
  intake: WritableSignal<ErIntake | null> = signal(null);
  loading: WritableSignal<boolean> = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private intakeService: ErIntakeService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadIntake(id);
    }
  }

  loadIntake(id: number): void {
    this.loading.set(true);
    this.intakeService.getIntake(id).subscribe({
      next: (data) => {
        this.intake.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Failed to load intake');
        this.loading.set(false);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
