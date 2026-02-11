import { Component } from '@angular/core';

@Component({
  selector: 'app-er-workspace',
  standalone: false,
  template: `
    <nz-layout class="layout-container" style="min-height: 100vh;">
      <nz-layout>
        <nz-content class="p-6 bg-gray-50">
          <nz-page-header nzTitle="Employee Relations"></nz-page-header>
          <nz-tabs nzLinkRouter class="mb-4">
            <nz-tab nzTitle="Cases" routerLink="cases"></nz-tab>
            <nz-tab nzTitle="Templates" routerLink="templates"></nz-tab>
          </nz-tabs>
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
export class ErWorkspaceComponent {}
