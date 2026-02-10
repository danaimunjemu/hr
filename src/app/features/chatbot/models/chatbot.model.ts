export interface ChatMessage {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatbotRequest {
  memoryId: string;
  message: string;
}

export interface ChatbotResponse {
  memoryId: string;
  responseMessage: string;
}
