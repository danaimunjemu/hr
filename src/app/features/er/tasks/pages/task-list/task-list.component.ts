import { Component, OnInit } from '@angular/core';
import { ErTaskService } from '../../services/er-task.service';
import { ErTask } from '../../models/er-task.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-task-list',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">ER Tasks</h1>
      <button nz-button nzType="primary" routerLink="create">Add Task</button>
    </div>

    <nz-table #basicTable [nzData]="tasks" [nzLoading]="loading">
      <thead>
        <tr>
          <th>Title</th>
          <th>Type</th>
          <th>Status</th>
          <th>Assigned To</th>
          <th>Due Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let data of basicTable.data">
          <td>
            <a [routerLink]="['view', data.id]">{{ data.title }}</a>
            <div class="text-xs text-gray-500" *ngIf="data.erCase">Case: {{ data.erCase.id }}</div>
          </td>
          <td>
            <nz-tag [nzColor]="getTypeColor(data.taskType)">{{ data.taskType }}</nz-tag>
          </td>
          <td>
            <nz-tag [nzColor]="getStatusColor(data.status)">{{ data.status }}</nz-tag>
          </td>
          <td>{{ data.assignedTo.firstName }} {{ data.assignedTo.lastName }}</td>
          <td>{{ data.dueAt | date:'medium' }}</td>
          <td>
            <a [routerLink]="['view', data.id]">View</a>
            <nz-divider nzType="vertical"></nz-divider>
            <a [routerLink]="['edit', data.id]">Edit</a>
            <nz-divider nzType="vertical"></nz-divider>
            <a nz-popconfirm nzPopconfirmTitle="Are you sure delete this task?" (nzOnConfirm)="deleteTask(data.id)" class="text-red-500">Delete</a>
          </td>
        </tr>
      </tbody>
    </nz-table>
  `
})
export class TaskListComponent implements OnInit {
  tasks: ErTask[] = [];
  loading = false;

  constructor(
    private taskService: ErTaskService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load tasks');
        this.loading = false;
      }
    });
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.message.success('Task deleted successfully');
        this.loadData();
      },
      error: () => {
        this.message.error('Failed to delete task');
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return 'blue';
      case 'IN_PROGRESS': return 'orange';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'INVESTIGATION': return 'geekblue';
      case 'REVIEW': return 'cyan';
      case 'MEETING': return 'purple';
      default: return 'default';
    }
  }
}
