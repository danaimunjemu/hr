import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErProcessComponent } from './er-process.component';
import { CaseCreateProcessComponent } from './components/case-create-process/case-create-process.component';
import { CaseAssignComponent } from './components/case-assign/case-assign.component';
import { CaseIntakeComponent } from './components/case-intake/case-intake.component';
import { CaseOutcomeComponent } from './components/case-outcome/case-outcome.component';
import { CaseCloseComponent } from './components/case-close/case-close.component';
import { CaseTasksComponent } from './components/case-tasks/case-tasks.component';
import { TaskCompleteComponent } from './components/task-complete/task-complete.component';
import { TaskParticipantsComponent } from './components/task-participants/task-participants.component';
import { TaskDocumentsComponent } from './components/task-documents/task-documents.component';
import { IntakeDocumentsComponent } from './components/intake-documents/intake-documents.component';
import { OutcomeDocumentsComponent } from './components/outcome-documents/outcome-documents.component';

const routes: Routes = [
  {
    path: '',
    component: ErProcessComponent,
    children: [
      { path: '', redirectTo: 'create', pathMatch: 'full' },
      { path: 'create', component: CaseCreateProcessComponent },
      { path: 'assign', component: CaseAssignComponent },
      { path: 'intake', component: CaseIntakeComponent },
      { path: 'outcome', component: CaseOutcomeComponent },
      { path: 'close', component: CaseCloseComponent },
      { path: 'tasks', component: CaseTasksComponent },
      { path: 'tasks/complete', component: TaskCompleteComponent },
      { path: 'tasks/participants', component: TaskParticipantsComponent },
      { path: 'tasks/documents', component: TaskDocumentsComponent },
      { path: 'intake/documents', component: IntakeDocumentsComponent },
      { path: 'outcome/documents', component: OutcomeDocumentsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErProcessRoutingModule { }
