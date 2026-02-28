import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
    RouterModule.forChild(routes)
  ],
  providers: [OrganogramV2Service],
})
export class OrganogramV2Module {}
