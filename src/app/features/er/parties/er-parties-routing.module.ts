import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartyListComponent } from './pages/party-list/party-list.component';
import { PartyCreateComponent } from './pages/party-create/party-create.component';
import { PartyEditComponent } from './pages/party-edit/party-edit.component';
import { PartyViewComponent } from './pages/party-view/party-view.component';

const routes: Routes = [
  { path: '', component: PartyListComponent },
  { path: 'create', component: PartyCreateComponent },
  { path: 'edit/:id', component: PartyEditComponent },
  { path: 'view/:id', component: PartyViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErPartiesRoutingModule { }
