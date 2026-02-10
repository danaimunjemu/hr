import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AntDesignModules } from '../../../core/modules/antdesign.module';
import { ErProcessRoutingModule } from './er-process-routing.module';

import { ErProcessComponent } from './er-process.component';
import { CaseAssignComponent } from './components/case-assign/case-assign.component';
import { CaseIntakeComponent } from './components/case-intake/case-intake.component';
import { CaseOutcomeComponent } from './components/case-outcome/case-outcome.component';
import { CaseCloseComponent } from './components/case-close/case-close.component';
import { TaskCompleteComponent } from './components/task-complete/task-complete.component';
import { TaskParticipantsComponent } from './components/task-participants/task-participants.component';
import { TaskDocumentsComponent } from './components/task-documents/task-documents.component';
import { IntakeDocumentsComponent } from './components/intake-documents/intake-documents.component';
import { OutcomeDocumentsComponent } from './components/outcome-documents/outcome-documents.component';
import { CaseTasksComponent } from './components/case-tasks/case-tasks.component';
import { CaseCreateProcessComponent } from './components/case-create-process/case-create-process.component';

@NgModule({
  declarations: [
    ErProcessComponent,
    CaseAssignComponent,
    CaseIntakeComponent,
    CaseOutcomeComponent,
    CaseCloseComponent,
    TaskCompleteComponent,
    TaskParticipantsComponent,
    TaskDocumentsComponent,
    IntakeDocumentsComponent,
    OutcomeDocumentsComponent,
    CaseTasksComponent,
    CaseCreateProcessComponent
  ],
  imports: [
    CommonModule,
    ErProcessRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AntDesignModules
  ]
})
export class ErProcessModule { }
