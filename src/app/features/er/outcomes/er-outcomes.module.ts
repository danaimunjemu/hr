import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ErOutcomesRoutingModule } from './er-outcomes-routing.module';
import { AntDesignModules } from '../../../core/modules/antdesign.module';

import { OutcomeListComponent } from './pages/outcome-list/outcome-list.component';
import { OutcomeCreateComponent } from './pages/outcome-create/outcome-create.component';
import { OutcomeEditComponent } from './pages/outcome-edit/outcome-edit.component';
import { OutcomeViewComponent } from './pages/outcome-view/outcome-view.component';

@NgModule({
  declarations: [
    OutcomeListComponent,
    OutcomeCreateComponent,
    OutcomeEditComponent,
    OutcomeViewComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ErOutcomesRoutingModule,
    AntDesignModules
  ]
})
export class ErOutcomesModule { }
