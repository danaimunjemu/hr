import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { RouterModule, Routes } from '@angular/router';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { OrganogramV2Component } from './organogram-v2.component';
import { OrganogramV2Service } from './organogram-v2.service';

const routes: Routes = [
  { path: '', component: OrganogramV2Component }
];

@NgModule({
  declarations: [OrganogramV2Component],
  imports: [
    CommonModule,
    FormsModule,
    AntDesignModules,
    NzSelectModule,
    NzCollapseModule,
    NzInputModule,
    NzCardModule,
    NzListModule,
    NzSkeletonModule,
    NzEmptyModule,
    NzAlertModule,
    RouterModule.forChild(routes)
  ],
  providers: [OrganogramV2Service],
  schemas:[NO_ERRORS_SCHEMA,CUSTOM_ELEMENTS_SCHEMA]
})
export class OrganogramV2Module {}
