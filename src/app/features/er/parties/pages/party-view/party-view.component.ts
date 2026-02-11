import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErPartyService } from '../../services/er-party.service';
import { ErParty } from '../../models/er-party.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-party-view',
  standalone: false,
  template: `
    <div class="page-header">
      <nz-page-header (nzBack)="onBack()" nzBackIcon nzTitle="Party Details">
        <nz-page-header-extra>
          <button nz-button nzType="primary" [routerLink]="['../../edit', party()?.id]">Edit</button>
        </nz-page-header-extra>
      </nz-page-header>
    </div>

    <nz-spin [nzSpinning]="loading()">
      <div *ngIf="party() as party">
        <nz-card nzTitle="General Information" class="mb-4">
          <nz-descriptions [nzColumn]="2" nzBordered>
            <nz-descriptions-item nzTitle="Linked Case">
              <a [routerLink]="['/er/cases/view', party.erCase.id]">
                {{ party.erCase.caseNumber || 'Case #' + party.erCase.id }}
              </a>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Role">
              <nz-tag>{{ party.role }}</nz-tag>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Person Type">{{ party.personType }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Name">
              <ng-container *ngIf="party.personType === 'EMPLOYEE'; else externalName">
                {{ party.employee?.firstName }} {{ party.employee?.lastName }}
              </ng-container>
              <ng-template #externalName>{{ party.externalName || 'N/A' }}</ng-template>
            </nz-descriptions-item>
          </nz-descriptions>
        </nz-card>

        <nz-card nzTitle="Notes">
          <p>{{ party.notes || 'No notes available.' }}</p>
        </nz-card>
      </div>
    </nz-spin>
  `,
  styles: [`
    .mb-4 { margin-bottom: 16px; }
  `]
})
export class PartyViewComponent implements OnInit {
  party: WritableSignal<ErParty | null> = signal(null);
  loading: WritableSignal<boolean> = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private partyService: ErPartyService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadParty(id);
    }
  }

  loadParty(id: number): void {
    this.loading.set(true);
    this.partyService.getParty(id).subscribe({
      next: (data) => {
        this.party.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Failed to load party');
        this.loading.set(false);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
