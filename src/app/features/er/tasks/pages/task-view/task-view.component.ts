import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErTaskService } from '../../services/er-task.service';
import { ErTask } from '../../models/er-task.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-task-view',
  standalone: false,
  template: `
    <nz-page-header (nzBack)="onBack()" nzBackIcon nzTitle="Task Details">
      <nz-page-header-extra>
        <button nz-button nzType="default" (click)="onEdit()">Edit</button>
      </nz-page-header-extra>
    </nz-page-header>

    <nz-spin [nzSpinning]="loading">
      <div *ngIf="task">
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="16">
            <nz-card nzTitle="General Information" class="mb-4">
              <nz-descriptions [nzColumn]="1" nzBordered>
                <nz-descriptions-item nzTitle="Title">{{ task.title }}</nz-descriptions-item>
                <nz-descriptions-item nzTitle="Case ID">
                  <a *ngIf="task.erCase" [routerLink]="['/er/cases/view', task.erCase.id]">#{{ task.erCase.id }}</a>
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Description">{{ task.description || 'N/A' }}</nz-descriptions-item>
                <nz-descriptions-item nzTitle="Type">
                  <nz-tag>{{ task.taskType }}</nz-tag>
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Status">
                  <nz-tag>{{ task.status }}</nz-tag>
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Due Date">{{ task.dueAt | date:'medium' }}</nz-descriptions-item>
              </nz-descriptions>
            </nz-card>
            
            <nz-card nzTitle="Completion Details" class="mb-4" *ngIf="task.completionNotes">
               <p>{{ task.completionNotes }}</p>
            </nz-card>
          </div>
          
          <div nz-col [nzSpan]="8">
            <nz-card nzTitle="Assignment" class="mb-4">
              <nz-descriptions [nzColumn]="1" nzBordered>
                <nz-descriptions-item nzTitle="Assigned To">
                  {{ task.assignedTo.firstName }} {{ task.assignedTo.lastName }}
                </nz-descriptions-item>
              </nz-descriptions>
            </nz-card>
          </div>
        </div>
      </div>
    </nz-spin>
  `
})
export class TaskViewComponent implements OnInit {
  task: ErTask | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: ErTaskService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(Number(id));
    }
  }

  loadData(id: number): void {
    this.loading = true;
    this.taskService.getTask(id).subscribe({
      next: (data) => {
        this.task = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load task details');
        this.loading = false;
      }
    });
  }

  onBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  onEdit(): void {
    if (this.task) {
      this.router.navigate(['../../edit', this.task.id], { relativeTo: this.route });
    }
  }
}
