import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntDesignModules } from '../../../core/modules/antdesign.module';

@Component({
  selector: 'app-er-parties',
  standalone: true,
  imports: [CommonModule, AntDesignModules],
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
