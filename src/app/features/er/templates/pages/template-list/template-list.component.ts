import { Component, OnInit } from '@angular/core';
import { ErTemplateService } from '../../services/er-template.service';
import { ErTemplate } from '../../models/er-template.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-template-list',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">Case Templates</h1>
      <button nz-button nzType="primary" routerLink="create">Add Template</button>
    </div>

    <nz-table #basicTable [nzData]="templates" [nzLoading]="loading">
      <thead>
        <tr>
          <th>Name</th>
          <th>Case Type</th>
          <th>Version</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let data of basicTable.data">
          <td><a [routerLink]="['view', data.id]">{{ data.name }}</a></td>
          <td>
            <nz-tag [nzColor]="getTypeColor(data.caseType)">{{ data.caseType }}</nz-tag>
          </td>
          <td>{{ data.version }}</td>
          <td>
            <nz-tag [nzColor]="data.active ? 'green' : 'red'">
              {{ data.active ? 'Active' : 'Inactive' }}
            </nz-tag>
          </td>
          <td>
            <a [routerLink]="['view', data.id]">View</a>
            <nz-divider nzType="vertical"></nz-divider>
            <a [routerLink]="['edit', data.id]">Edit</a>
            <nz-divider nzType="vertical"></nz-divider>
            <a nz-popconfirm nzPopconfirmTitle="Are you sure delete this template?" (nzOnConfirm)="deleteTemplate(data.id)" class="text-red-500">Delete</a>
          </td>
        </tr>
      </tbody>
    </nz-table>
  `
})
export class TemplateListComponent implements OnInit {
  templates: ErTemplate[] = [];
  loading = false;

  constructor(
    private templateService: ErTemplateService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.templateService.getTemplates().subscribe({
      next: (data) => {
        this.templates = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load templates');
        this.loading = false;
      }
    });
  }

  deleteTemplate(id: number): void {
    this.templateService.deleteTemplate(id).subscribe({
      next: () => {
        this.message.success('Template deleted successfully');
        this.loadData();
      },
      error: () => {
        this.message.error('Failed to delete template');
      }
    });
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'MISCONDUCT': return 'red';
      case 'GRIEVANCE': return 'orange';
      case 'PERFORMANCE': return 'blue';
      default: return 'default';
    }
  }
}
