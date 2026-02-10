import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ErIntakesRoutingModule } from './er-intakes-routing.module';
import { AntDesignModules } from '../../../core/modules/antdesign.module';

import { IntakeListComponent } from './pages/intake-list/intake-list.component';
import { IntakeCreateComponent } from './pages/intake-create/intake-create.component';
import { IntakeEditComponent } from './pages/intake-edit/intake-edit.component';
import { IntakeViewComponent } from './pages/intake-view/intake-view.component';

@NgModule({
  declarations: [
    IntakeListComponent,
    IntakeCreateComponent,
    IntakeEditComponent,
    IntakeViewComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ErIntakesRoutingModule,
    AntDesignModules
  ]
})
export class ErIntakesModule { }
