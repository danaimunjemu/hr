import { Component, ElementRef, ViewChild, AfterViewChecked, signal, WritableSignal } from '@angular/core';
import { ChatbotService } from '../../services/chatbot.service';
import { ChatMessage } from '../../models/chatbot.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-chatbot-page',
  standalone: false,
  templateUrl: './chatbot-page.component.html',
  styleUrls: ['./chatbot-page.component.scss']
})
export class ChatbotPageComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isLoading: WritableSignal<boolean> = signal(false);
  userInput = '';
  messages: ChatMessage[] = [
    {
      content: 'Hello! I am your HR Assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ];

  constructor(private chatbotService: ChatbotService) {}

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (!this.userInput.trim() || this.isLoading()) return;

    const userMsg = this.userInput.trim();
    this.addMessage(userMsg, 'user');
    this.userInput = '';
    this.isLoading.set(true);

    this.chatbotService.sendMessage(userMsg)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.addMessage(res.response || 'I received your message but got no text reply.', 'bot');
        },
        error: () => {
          this.addMessage('Sorry, I encountered an error connecting to the server.', 'bot');
        }
      });
  }

  private addMessage(content: string, sender: 'user' | 'bot'): void {
    this.messages.push({
      content,
      sender,
      timestamp: new Date()
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll to bottom failed', err);
    }
  }
}
