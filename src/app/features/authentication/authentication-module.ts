import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthenticationRoutingModule } from './authentication-routing-module';
import {SharedModule} from '../../shared/shared-module';
import {AntDesignModules} from '../../core/modules/antdesign.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Login } from './pages/login/login';
import { ActivateAccount } from './pages/activate-account/activate-account';


@NgModule({
  declarations: [
    Login,
    ActivateAccount
  ],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    SharedModule,
    AntDesignModules,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class AuthenticationModule { }
