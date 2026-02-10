import { Component } from '@angular/core';

@Component({
  selector: 'app-er-workspace',
  standalone: false,
  template: `
    <nz-layout class="layout-container" style="min-height: 100vh;">
      <nz-sider [nzWidth]="240" nzTheme="light" class="border-r border-gray-200">
        <div class="p-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-800 m-0">Employee Relations</h2>
        </div>
        <ul nz-menu nzMode="inline" class="border-none">
          <li nz-menu-item nzMatchRouter>
            <a routerLink="cases">
              <span nz-icon nzType="file-text"></span>
              <span>Cases</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="intakes">
              <span nz-icon nzType="inbox"></span>
              <span>Intakes</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="outcomes">
              <span nz-icon nzType="check-circle"></span>
              <span>Outcomes</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="parties">
              <span nz-icon nzType="team"></span>
              <span>Parties</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="process">
              <span nz-icon nzType="deployment-unit"></span>
              <span>Process</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="tasks">
              <span nz-icon nzType="unordered-list"></span>
              <span>Tasks</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="templates">
              <span nz-icon nzType="snippets"></span>
              <span>Templates</span>
            </a>
          </li>
        </ul>
      </nz-sider>
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
export class ErWorkspaceComponent {}
