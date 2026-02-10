import { Component } from '@angular/core';

@Component({
  selector: 'app-ohs-shell',
  standalone: false,
  template: `
    <nz-layout class="layout-container" style="height: 100%;">
      <nz-sider [nzWidth]="240" nzTheme="light" class="border-r border-gray-200">
        <div class="p-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-800 m-0">OHS Management</h2>
        </div>
        <ul nz-menu nzMode="inline" class="border-none">
          <li nz-menu-item nzMatchRouter>
            <a routerLink="dashboard">
              <span nz-icon nzType="dashboard"></span>
              <span>Dashboard</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="incidents">
              <span nz-icon nzType="alert"></span>
              <span>Safety Incidents</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="near-misses">
              <span nz-icon nzType="warning"></span>
              <span>Near Miss Reports</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="medical">
              <span nz-icon nzType="medicine-box"></span>
              <span>Medical Surveillance</span>
            </a>
          </li>
          
        </ul>
      </nz-sider>
      <nz-layout>
        <nz-content class="p-6 bg-gray-50 overflow-y-auto">
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
  `]
})
export class OhsShellComponent {}


// <li nz-menu-item nzMatchRouter>
//             <a routerLink="inductions">
//               <span nz-icon nzType="idcard"></span>
//               <span>Inductions</span>
//             </a>
//           </li>
//           <li nz-menu-item nzMatchRouter>
//             <a routerLink="corrective-actions">
//               <span nz-icon nzType="check-square"></span>
//               <span>Corrective Actions</span>
//             </a>
//           </li>
