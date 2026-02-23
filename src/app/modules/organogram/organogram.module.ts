import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgxInteractiveOrgChart } from 'ngx-interactive-org-chart';
import { AntDesignModules } from '../../core/modules/antdesign.module';
import { OrganogramComponent } from './organogram.component';

const routes: Routes = [
  { path: '', component: OrganogramComponent }
];

@NgModule({
  declarations: [OrganogramComponent],
  imports: [
    CommonModule,
    FormsModule,
    AntDesignModules,
    NgxInteractiveOrgChart,
    RouterModule.forChild(routes)
  ]
})
export class OrganogramModule {}
