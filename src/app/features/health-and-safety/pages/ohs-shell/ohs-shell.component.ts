import { Component } from '@angular/core';

@Component({
  selector: 'app-ohs-shell',
  standalone: false,
  template: `
    <nz-layout class="layout-container" style="height: 100%;">
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
export class OhsShellComponent { }


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
