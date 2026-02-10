import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ChatbotRequest, ChatbotResponse } from '../models/chatbot.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly API_URL = 'http://localhost:8090/api/chatbot/message'; // Adjust base URL as needed
  private readonly STORAGE_KEY = 'chatbot_memory_id';

  constructor(private http: HttpClient) {}

  /**
   * Sends a message to the chatbot backend.
   * @param message The user's message.
   * @returns Observable of the bot's response.
   */
  sendMessage(message: string): Observable<ChatbotResponse> {
    const payload: ChatbotRequest = {
      memoryId: this.getMemoryId(),
      message: message
    };

    return this.http.post<ChatbotResponse>(this.API_URL, payload).pipe(
      catchError(error => {
        console.error('Chatbot API Error:', error);
        return throwError(() => new Error('Failed to send message to chatbot.'));
      })
    );
  }

  /**
   * Retrieves the current session's memoryId or generates a new one.
   * Persists in SessionStorage to maintain context during page reloads.
   */
  private getMemoryId(): string {
    let memoryId = sessionStorage.getItem(this.STORAGE_KEY);
    if (!memoryId) {
      memoryId = uuidv4();
      sessionStorage.setItem(this.STORAGE_KEY, memoryId);
    }
    return memoryId;
  }

  /**
   * Clears the current chat session memory.
   */
  clearSession(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}
