export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: number;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  last_message?: string;
}

export interface ChatRequest {
  conversationId: string;
  message: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}
