import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthLayout } from './components/layout/auth-layout/auth-layout';
import { MainLayout } from './components/layout/main-layout/main-layout';
import {AntDesignModules} from '../core/modules/antdesign.module';
import {Button} from './components/button/button';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { Breadcrumb } from './components/layout/main-layout/breadcrumb/breadcrumb';
import { SideNav } from './components/layout/main-layout/side-nav/side-nav';
import { TopNav } from './components/layout/main-layout/top-nav/top-nav';
import {FormsModule} from '@angular/forms';
import {NzDropdownDirective, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';


@NgModule({
  declarations: [
    AuthLayout,
    MainLayout,
    Button,
    Breadcrumb,
    SideNav,
    TopNav
  ],
  imports: [
    CommonModule,
    AntDesignModules,
    RouterOutlet,
    FormsModule,
    NzDropdownDirective,
    NzDropdownMenuComponent,
    RouterLink,
    RouterLinkActive,
    NzModalModule
  ],
  exports: [
    Button
  ]
})
export class SharedModule { }
