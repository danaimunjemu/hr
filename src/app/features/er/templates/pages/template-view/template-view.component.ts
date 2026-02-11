import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErTemplateService } from '../../services/er-template.service';
import { ErTemplate } from '../../models/er-template.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-template-view',
  standalone: false,
  template: `
    <nz-page-header (nzBack)="onBack()" nzBackIcon nzTitle="Template Details">
      <nz-page-header-extra>
        <button nz-button nzType="default" (click)="onEdit()">Edit</button>
      </nz-page-header-extra>
    </nz-page-header>

    <nz-spin [nzSpinning]="loading()">
      <div *ngIf="template() as template">
        <nz-card>
          <nz-descriptions [nzColumn]="1" nzBordered>
            <nz-descriptions-item nzTitle="Name">{{ template.name }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Case Type">
              <nz-tag>{{ template.caseType }}</nz-tag>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Version">{{ template.version }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Status">
              <nz-tag [nzColor]="template.active ? 'green' : 'red'">
                {{ template.active ? 'Active' : 'Inactive' }}
              </nz-tag>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Default Confidentiality">
              <nz-tag>{{ template.defaultConfidentiality || 'N/A' }}</nz-tag>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Description">{{ template.description || 'N/A' }}</nz-descriptions-item>
          </nz-descriptions>
        </nz-card>
      </div>
    </nz-spin>
  `
})
export class TemplateViewComponent implements OnInit {
  template: WritableSignal<ErTemplate | null> = signal(null);
  loading: WritableSignal<boolean> = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private templateService: ErTemplateService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(Number(id));
    }
  }

  loadData(id: number): void {
    this.loading.set(true);
    this.templateService.getTemplate(id).subscribe({
      next: (data) => {
        this.template.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Failed to load template details');
        this.loading.set(false);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  onEdit(): void {
    const template = this.template();
    if (template) {
      this.router.navigate(['../../edit', template.id], { relativeTo: this.route });
    }
  }
}
