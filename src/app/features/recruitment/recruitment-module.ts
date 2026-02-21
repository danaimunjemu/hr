import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecruitmentRoutingModule } from './recruitment-routing-module';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { SharedModule } from '../../shared/shared-module';
import { RecruitmentPageComponent } from './pages/recruitment-page/recruitment-page.component';
import { NzSpaceModule } from 'ng-zorro-antd/space';


@NgModule({
  declarations: [
    RecruitmentPageComponent
  ],
  imports: [
    CommonModule,
    RecruitmentRoutingModule,
    AntDesignModules,
    SharedModule,
    NzSpaceModule
  ]
})
export class RecruitmentModule { }
