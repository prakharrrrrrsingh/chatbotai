import { 
  type Conversation, 
  type InsertConversation, 
  type Message, 
  type InsertMessage 
} from "@shared/schema";

// Storage interface for conversation and messages
export interface IStorage {
  // Conversation methods
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  listConversations(): Promise<Conversation[]>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private conversationCurrentId: number;
  private messageCurrentId: number;

  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
    this.conversationCurrentId = 1;
    this.messageCurrentId = 1;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationCurrentId++;
    const conversation: Conversation = { 
      ...insertConversation, 
      id, 
      createdAt: new Date() 
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async listConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }

  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(),
      // Ensure conversationId is always a number
      conversationId: insertMessage.conversationId || 0
    };
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
