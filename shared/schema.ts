import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define AI model types
export const AIModelEnum = z.enum(["gpt", "claude", "llama", "gemini"]);
export type AIModel = z.infer<typeof AIModelEnum>;

// Chat message role type
export const MessageRoleEnum = z.enum(["user", "assistant", "system"]);
export type MessageRole = z.infer<typeof MessageRoleEnum>;

// Define chat context message schema
export const ChatContextSchema = z.object({
  role: MessageRoleEnum,
  content: z.string()
});
export type ChatContext = z.infer<typeof ChatContextSchema>;

// Define chat completion request schema
export const ChatCompletionRequestSchema = z.object({
  message: z.string().min(1),
  model: AIModelEnum,
  context: z.array(ChatContextSchema)
});
export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequestSchema>;

// Define conversation table (for storing chat history)
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Define messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: serial("conversation_id").references(() => conversations.id),
  content: text("content").notNull(),
  role: text("role").notNull(),
  model: text("model"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Create insert schemas
export const insertConversationSchema = createInsertSchema(conversations);
export const insertMessageSchema = createInsertSchema(messages);

// Export types
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
