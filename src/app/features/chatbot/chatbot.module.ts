import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';

// NG-ZORRO Imports
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { ChatbotRoutingModule } from './chatbot-routing.module';
import { ChatbotPageComponent } from './pages/chatbot-page/chatbot-page.component';
import { ChatbotService } from './services/chatbot.service';

@NgModule({
  declarations: [
    ChatbotPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MarkdownModule.forRoot(),
    ChatbotRoutingModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzCardModule,
    NzAvatarModule,
    NzSpinModule
  ],
  providers: [
    ChatbotService
  ]
})
export class ChatbotModule { }
