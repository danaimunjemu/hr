import { Component } from '@angular/core';

@Component({
  selector: 'app-er-workspace',
  standalone: false,
  template: `
    <nz-layout class="layout-container" style="min-height: 100vh;">
      <nz-layout>
        <nz-content class="p-6 bg-gray-50">
          <router-outlet></router-outlet>
        </nz-content>
      </nz-layout>
    </nz-layout>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .layout-container {
      background: #f9fafb;
    }
  `]
})
export class ErWorkspaceComponent { }
