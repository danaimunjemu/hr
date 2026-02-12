import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatbotPageComponent } from './pages/chatbot-page/chatbot-page.component';

const routes: Routes = [
  { path: '', component: ChatbotPageComponent, data: { breadcrumb: 'Chatbot' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatbotRoutingModule { }
