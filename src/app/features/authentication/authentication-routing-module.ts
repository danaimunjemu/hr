import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthLayout} from '../../shared/components/layout/auth-layout/auth-layout';
import {Login} from './pages/login/login';

const routes: Routes = [
  { path: '', component: AuthLayout, children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: Login },
    ] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
