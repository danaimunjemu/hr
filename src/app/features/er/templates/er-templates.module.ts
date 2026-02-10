import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AntDesignModules } from '../../../core/modules/antdesign.module';
import { ErTemplatesRoutingModule } from './er-templates-routing.module';

import { TemplateListComponent } from './pages/template-list/template-list.component';
import { TemplateCreateComponent } from './pages/template-create/template-create.component';
import { TemplateEditComponent } from './pages/template-edit/template-edit.component';
import { TemplateViewComponent } from './pages/template-view/template-view.component';

@NgModule({
  declarations: [
    TemplateListComponent,
    TemplateCreateComponent,
    TemplateEditComponent,
    TemplateViewComponent
  ],
  imports: [
    CommonModule,
    ErTemplatesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AntDesignModules
  ]
})
export class ErTemplatesModule { }
