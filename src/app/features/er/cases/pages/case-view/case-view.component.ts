import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErCaseService } from '../../services/er-case.service';
import { ErCase } from '../../models/er-case.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-case-view',
  standalone: false,
  template: `
    <div class="page-header">
      <nz-page-header (nzBack)="onBack()" nzBackIcon nzTitle="Case Details" [nzSubtitle]="case?.caseNumber">
        <nz-page-header-extra>
          <button nz-button nzType="primary" [routerLink]="['../../edit', case?.id]">Edit</button>
        </nz-page-header-extra>
      </nz-page-header>
    </div>

    <nz-spin [nzSpinning]="loading">
      <div *ngIf="case">
        <nz-card nzTitle="General Information" class="mb-4">
          <nz-descriptions [nzColumn]="2" nzBordered>
            <nz-descriptions-item nzTitle="Title">{{ case!.title }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Case Type">{{ case!.caseType }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Status"><nz-tag>{{ case!.status }}</nz-tag></nz-descriptions-item>
            <nz-descriptions-item nzTitle="Priority"><nz-tag>{{ case!.priority }}</nz-tag></nz-descriptions-item>
            <nz-descriptions-item nzTitle="Confidentiality">{{ case!.confidentiality }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Current Stage">{{ case!.currentStageCode }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Created On">{{ case!.createdOn | date:'medium' }}</nz-descriptions-item>
          </nz-descriptions>
        </nz-card>

        <nz-card nzTitle="People Involved" class="mb-4">
          <nz-descriptions [nzColumn]="2" nzBordered>
            <nz-descriptions-item nzTitle="Subject Employee">
              {{ case!.subjectEmployee.firstName }} {{ case!.subjectEmployee.lastName }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Reporter">
              {{ case!.reporterEmployee.firstName }} {{ case!.reporterEmployee.lastName }} ({{ case!.reporterType }})
            </nz-descriptions-item>
          </nz-descriptions>
        </nz-card>

        <nz-card nzTitle="Summary">
          <p>{{ case!.summary }}</p>
        </nz-card>
      </div>
    </nz-spin>
  `,
  styles: [`
    .mb-4 { margin-bottom: 16px; }
  `]
})
export class CaseViewComponent implements OnInit {
  case: ErCase | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: ErCaseService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadCase(id);
    }
  }

  loadCase(id: number): void {
    this.loading = true;
    this.caseService.getCase(id).subscribe({
      next: (data) => {
        this.case = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load case');
        this.loading = false;
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
