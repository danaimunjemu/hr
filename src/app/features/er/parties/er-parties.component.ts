import { Component } from '@angular/core';

@Component({
  selector: 'app-er-parties',
  standalone: false,
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">ER Parties</h1>
      <button nz-button nzType="primary">Add Party</button>
    </div>
    <nz-card>
      <div class="text-center text-gray-500 py-12">
        <span nz-icon nzType="team" nzTheme="outline" style="font-size: 32px; margin-bottom: 16px;"></span>
        <p>ER Parties content area</p>
      </div>
    </nz-card>
  `
})
export class ErPartiesComponent {}
