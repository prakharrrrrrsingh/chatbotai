export type AIModel = 'gpt' | 'claude' | 'llama' | 'gemini';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  model?: AIModel;
  imageUrl?: string; // Optional URL to an image if the message includes an image
  analysis?: string; // Optional analysis results from AI
  sentiment?: SentimentAnalysis; // Optional sentiment analysis result
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  explanation: string;
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

export interface ImageAnalysisRequest {
  image: File;
  prompt?: string;
}

export interface ImageAnalysisResponse {
  analysis: string;
}

export interface SentimentAnalysisRequest {
  text: string;
}

export interface EmbeddingRequest {
  text: string;
}

export interface EmbeddingResponse {
  embedding: number[];
}
