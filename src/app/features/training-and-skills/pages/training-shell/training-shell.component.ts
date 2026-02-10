import { Component } from '@angular/core';

@Component({
  selector: 'app-training-shell',
  standalone: false,
  template: `
    <nz-layout class="layout-container" style="height: 100%;">
      <nz-sider [nzWidth]="240" nzTheme="light" class="border-r border-gray-200">
        <div class="p-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-800 m-0">Training & Skills</h2>
        </div>
        <ul nz-menu nzMode="inline" class="border-none">
          <li nz-menu-item nzMatchRouter>
            <a routerLink="dashboard">
              <span nz-icon nzType="dashboard"></span>
              <span>Dashboard</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="calendar">
              <span nz-icon nzType="calendar"></span>
              <span>Training Calendar</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="programs">
              <span nz-icon nzType="read"></span>
              <span>Training Programs</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="sessions">
              <span nz-icon nzType="schedule"></span>
              <span>Training Sessions</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="skills">
              <span nz-icon nzType="trophy"></span>
              <span>Skills Matrix</span>
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
export class TrainingShellComponent {}
