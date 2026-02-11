import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { ErRoutingModule } from './er-routing.module';

import { ErWorkspaceComponent } from './er-workspace/er-workspace.component';

@NgModule({
  declarations: [
    ErWorkspaceComponent
  ],
  imports: [
    CommonModule,
    ErRoutingModule,
    AntDesignModules
  ]
})
export class ErModule { }
