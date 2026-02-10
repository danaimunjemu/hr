import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ErPartiesRoutingModule } from './er-parties-routing.module';
import { AntDesignModules } from '../../../core/modules/antdesign.module';

import { PartyListComponent } from './pages/party-list/party-list.component';
import { PartyCreateComponent } from './pages/party-create/party-create.component';
import { PartyEditComponent } from './pages/party-edit/party-edit.component';
import { PartyViewComponent } from './pages/party-view/party-view.component';

@NgModule({
  declarations: [
    PartyListComponent,
    PartyCreateComponent,
    PartyEditComponent,
    PartyViewComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ErPartiesRoutingModule,
    AntDesignModules
  ]
})
export class ErPartiesModule { }
