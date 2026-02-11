import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ErCasesRoutingModule } from './er-cases-routing.module';
import { AntDesignModules } from '../../../core/modules/antdesign.module'; // Adjust path if needed
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { CaseListComponent } from './pages/case-list/case-list.component';
import { CaseCreateComponent } from './pages/case-create/case-create.component';
import { CaseEditComponent } from './pages/case-edit/case-edit.component';
import { CaseViewComponent } from './pages/case-view/case-view.component';
import { CaseCreateProcessComponent } from '../process/components/case-create-process/case-create-process.component';

@NgModule({
  declarations: [
    CaseListComponent,
    CaseCreateComponent,
    CaseCreateProcessComponent,
    CaseEditComponent,
    CaseViewComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ErCasesRoutingModule,
    AntDesignModules,
    NzTabsModule
  ]
})
export class ErCasesModule { }
