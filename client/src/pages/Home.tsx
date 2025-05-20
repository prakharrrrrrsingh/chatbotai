import { useState, useEffect, useRef } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage, AIModel } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "👋 Hello! I'm your AI assistant, powered by advanced language models. I can help with information, generate content, answer questions, or just chat. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
      model: "gpt"
    }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);
  const [currentModel, setCurrentModel] = useState<AIModel>("gpt");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const generateResponseMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        message,
        model: currentModel,
        context: messages.slice(-10).map(m => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content
        }))
      });
      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate response: ${error.message}`,
        variant: "destructive"
      });
      setIsTyping(false);
    }
  });

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await generateResponseMutation.mutateAsync(content);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: "ai",
        timestamp: new Date(),
        model: currentModel
      };

      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleModelChange = (model: AIModel) => {
    setCurrentModel(model);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        content: "👋 Hello! I'm your AI assistant, powered by advanced language models. I can help with information, generate content, answer questions, or just chat. How can I assist you today?",
        sender: "ai",
        timestamp: new Date(),
        model: currentModel
      }
    ]);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 dark:bg-slate-900 overflow-hidden">
      <ChatHeader 
        currentModel={currentModel} 
        onModelChange={handleModelChange} 
      />
      
      <ChatMessages 
        messages={messages} 
        isTyping={isTyping} 
        currentModel={currentModel}
        chatEndRef={chatEndRef}
      />
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
        onClearChat={handleClearChat}
        isTyping={isTyping}
      />
    </div>
  );
}
