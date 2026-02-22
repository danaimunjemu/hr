import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
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
    RouterModule.forChild(routes)
  ]
})
export class OrganogramModule {}
