import { Component } from '@angular/core';

@Component({
  selector: 'app-er-tasks',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">ER Tasks</h1>
      <button nz-button nzType="primary">Add Task</button>
    </div>
    <nz-card>
      <div class="text-center text-gray-500 py-12">
        <span nz-icon nzType="unordered-list" nzTheme="outline" style="font-size: 32px; margin-bottom: 16px;"></span>
        <p>ER Tasks content area</p>
      </div>
    </nz-card>
  `
})
export class ErTasksComponent {}
