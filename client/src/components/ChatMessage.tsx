import { ChatMessage as ChatMessageType } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { content, sender, model } = message;
  
  if (sender === "user") {
    return (
      <div className="message-enter flex flex-col max-w-3xl mx-auto w-full">
        <div className="flex items-start justify-end mb-4">
          <div className="bg-primary-light text-white rounded-2xl rounded-tr-none py-3 px-4 max-w-[85%] shadow-sm">
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          </div>
          <Avatar className="w-8 h-8 ml-2 bg-gray-300 text-gray-700">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }
  
  const modelDisplayNames: Record<string, string> = {
    "gpt": "GPT-4 Turbo",
    "claude": "Claude 3 Opus",
    "llama": "Llama 3",
    "gemini": "Gemini Pro"
  };
  
  return (
    <div className="message-enter flex flex-col max-w-3xl mx-auto w-full">
      <div className="flex items-start mb-4">
        <Avatar className="w-8 h-8 mr-2 bg-primary text-white">
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="bg-neutral-DEFAULT dark:bg-slate-700 rounded-2xl rounded-tl-none py-3 px-4 max-w-[85%] shadow-sm dark:text-white">
          <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMessage(content) }}></div>
          {model && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400">Model: {modelDisplayNames[model] || model}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Format message content to handle HTML-like formatting from the API
function formatMessage(content: string): string {
  // Convert **text** to <strong>text</strong>
  let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert line breaks to <br />
  formatted = formatted.replace(/\n/g, '<br />');
  
  return formatted;
}
