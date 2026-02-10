import { Component, OnInit } from '@angular/core';
import { ErPartyService } from '../../services/er-party.service';
import { ErParty } from '../../models/er-party.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-party-list',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold">Case Parties</h1>
      <button nz-button nzType="primary" routerLink="create">
        <span nz-icon nzType="plus"></span> Add Party
      </button>
    </div>

    <nz-card>
      <nz-table #basicTable [nzData]="parties" [nzLoading]="loading">
        <thead>
          <tr>
            <th>Case</th>
            <th>Role</th>
            <th>Type</th>
            <th>Name</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data">
            <td>
              <a [routerLink]="['/er/cases/view', data.erCase.id]">
                {{ data.erCase.caseNumber || 'Case #' + data.erCase.id }}
              </a>
            </td>
            <td><nz-tag>{{ data.role }}</nz-tag></td>
            <td>{{ data.personType }}</td>
            <td>
              <ng-container *ngIf="data.personType === 'EMPLOYEE'; else externalName">
                {{ data.employee?.firstName }} {{ data.employee?.lastName }}
              </ng-container>
              <ng-template #externalName>{{ data.externalName || 'N/A' }}</ng-template>
            </td>
            <td>{{ data.notes }}</td>
            <td>
              <a [routerLink]="['view', data.id]">View</a>
              <nz-divider nzType="vertical"></nz-divider>
              <a [routerLink]="['edit', data.id]">Edit</a>
              <nz-divider nzType="vertical"></nz-divider>
              <a nz-popconfirm nzPopconfirmTitle="Delete this party?" (nzOnConfirm)="deleteParty(data.id)" class="text-red-500">Delete</a>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
  `]
})
export class PartyListComponent implements OnInit {
  parties: ErParty[] = [];
  loading = true;

  constructor(
    private partyService: ErPartyService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadParties();
  }

  loadParties(): void {
    this.loading = true;
    this.partyService.getParties().subscribe({
      next: (data) => {
        this.parties = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load parties');
        this.loading = false;
      }
    });
  }

  deleteParty(id: number): void {
    this.partyService.deleteParty(id).subscribe({
      next: () => {
        this.message.success('Party deleted');
        this.loadParties();
      },
      error: () => this.message.error('Failed to delete party')
    });
  }
}
