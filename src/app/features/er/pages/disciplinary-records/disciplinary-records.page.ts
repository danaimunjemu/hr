import { Component, OnInit, signal } from '@angular/core';
import { ErCaseService } from '../../services/er-case.service';
import { ErWarningView, mapCaseToWarningView } from '../../models/er-warning.model';

@Component({
    selector: 'app-disciplinary-records',
    standalone: false,
    template: `
    <div class="p-6">
      <nz-page-header nzTitle="Disciplinary Records (Employment History)">
        <nz-page-header-extra>
          <nz-input-group [nzSuffix]="suffixIconSearch">
            <input type="text" nz-input placeholder="Search employee..." />
          </nz-input-group>
          <ng-template #suffixIconSearch>
            <i nz-icon nzType="search"></i>
          </ng-template>
        </nz-page-header-extra>
      </nz-page-header>

      <nz-card [nzLoading]="loading()">
        <nz-table #basicTable [nzData]="records()" [nzSize]="'middle'">
          <thead>
            <tr>
              <th>Case #</th>
              <th>Employee</th>
              <th>Warning Type</th>
              <th>Issue Date</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let data of basicTable.data">
              <td><a>{{ data.caseNumber }}</a></td>
              <td>{{ data.employeeName }}</td>
              <td>{{ data.type | titlecase }}</td>
              <td>{{ data.issueDate | date }}</td>
              <td>{{ data.expiryDate | date }}</td>
              <td>
                <app-warning-status-badge [status]="data.isExpired ? 'EXPIRED' : 'ACTIVE'"></app-warning-status-badge>
                <div *ngIf="!data.isExpired" class="text-xs text-gray-400 mt-1">
                  {{ data.daysRemaining }} days left
                </div>
              </td>
              <td>
                <a class="mr-2">View</a>
                <a>Files</a>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </nz-card>
    </div>
  `
})
export class DisciplinaryRecordsPage implements OnInit {
    records = signal<ErWarningView[]>([]);
    loading = signal(false);

    constructor(private erCaseService: ErCaseService) { }

    ngOnInit(): void {
        this.loadRecords();
    }

    loadRecords(): void {
        this.loading.set(true);
        this.erCaseService.getDisciplinaryCases().subscribe({
            next: (cases) => {
                const warningViews = cases
                    .filter(c => !!c.outcome)
                    .map(c => mapCaseToWarningView(c))
                    .filter(v => v !== null) as ErWarningView[];

                this.records.set(warningViews);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }
}
