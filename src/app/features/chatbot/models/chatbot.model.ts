export interface ChatMessage {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatbotRequest {
  memoryId: string;
  message: string;
}

// Adjust this interface based on the actual backend response structure
export interface ChatbotResponse {
  response: string; // Assumed field name, update if backend returns 'message', 'reply', etc.
}
