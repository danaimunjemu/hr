import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntDesignModules } from '../../../core/modules/antdesign.module';

@Component({
  selector: 'app-er-intakes',
  standalone: true,
  imports: [CommonModule, AntDesignModules],
  template: `
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-4">ER Intakes</h1>
      <button nz-button nzType="primary">New Intake</button>
    </div>
    <nz-card>
      <div class="text-center text-gray-500 py-12">
        <span nz-icon nzType="inbox" nzTheme="outline" style="font-size: 32px; margin-bottom: 16px;"></span>
        <p>ER Intakes content area</p>
      </div>
    </nz-card>
  `
})
export class ErIntakesComponent {}
