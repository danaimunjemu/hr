import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntDesignModules } from '../../../core/modules/antdesign.module';

@Component({
  selector: 'app-er-templates',
  standalone: true,
  imports: [CommonModule, AntDesignModules],
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">ER Templates</h1>
      <button nz-button nzType="primary">Create Template</button>
    </div>
    <nz-card>
      <div class="text-center text-gray-500 py-12">
        <span nz-icon nzType="snippets" nzTheme="outline" style="font-size: 32px; margin-bottom: 16px;"></span>
        <p>ER Templates content area</p>
      </div>
    </nz-card>
  `
})
export class ErTemplatesComponent {}
