export type AIModel = 'gpt' | 'claude' | 'llama' | 'gemini';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  model?: AIModel;
}

export interface ChatContext {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  message: string;
  model: AIModel;
  context: ChatContext[];
}

export interface ChatCompletionResponse {
  message: string;
  model: AIModel;
}
