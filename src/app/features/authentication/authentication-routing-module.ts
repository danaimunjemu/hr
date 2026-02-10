import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthLayout} from '../../shared/components/layout/auth-layout/auth-layout';
import {Login} from './pages/login/login';
import { ActivateAccount } from './pages/activate-account/activate-account';

const routes: Routes = [
  { path: '', component: AuthLayout, children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: Login },
      { path: 'activate-account', component: ActivateAccount },
    ] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
