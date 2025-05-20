import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PaperclipIcon, MicOff, TrashIcon, BrainCircuit, ShieldCheck, SendIcon } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  isTyping: boolean;
}

export default function ChatInput({ onSendMessage, onClearChat, isTyping }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isTyping) {
      onSendMessage(message);
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-2xl px-3 py-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type your message..."
              className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-sm resize-none max-h-32 dark:text-white"
              disabled={isTyping}
            />
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex space-x-1">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  <PaperclipIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  <MicOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
              </div>
              <div className="text-xs text-gray-400">
                <span>{message.length}</span>/4000
              </div>
            </div>
          </div>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 text-white rounded-full p-3 shadow-sm flex-shrink-0"
            disabled={!message.trim() || isTyping}
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </form>
      </div>
      
      <div className="max-w-3xl mx-auto mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <BrainCircuit className="h-4 w-4 mr-1.5 text-primary" />
            <span>Context aware</span>
          </div>
          <div className="flex items-center">
            <ShieldCheck className="h-4 w-4 mr-1.5 text-primary" />
            <span>Private & secure</span>
          </div>
        </div>
        <Button 
          onClick={onClearChat} 
          variant="ghost" 
          size="sm" 
          className="hover:text-primary transition-colors"
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          <span>Clear chat</span>
        </Button>
      </div>
    </div>
  );
}
