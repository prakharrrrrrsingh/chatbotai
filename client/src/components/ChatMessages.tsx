import { AIModel, ChatMessage as ChatMessageType } from "@/lib/types";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { RefObject } from "react";

interface ChatMessagesProps {
  messages: ChatMessageType[];
  isTyping: boolean;
  currentModel: AIModel;
  chatEndRef: RefObject<HTMLDivElement>;
}

export default function ChatMessages({ messages, isTyping, currentModel, chatEndRef }: ChatMessagesProps) {
  return (
    <div className="chat-container flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-900">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      
      {isTyping && <TypingIndicator model={currentModel} />}
      
      <div ref={chatEndRef} />
    </div>
  );
}
