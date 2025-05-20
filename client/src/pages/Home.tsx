import { useState, useEffect, useRef } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import { useToast } from "@/hooks/use-toast";
import { 
  ChatMessage, 
  AIModel, 
  SentimentAnalysis 
} from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "👋 Hello! I'm your AI assistant, powered by advanced language models. I can help with information, answer questions, analyze images, perform sentiment analysis, or just chat. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
      model: "gpt"
    }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);
  const [currentModel, setCurrentModel] = useState<AIModel>("gpt");
  const [isSentimentAnalysisEnabled, setIsSentimentAnalysisEnabled] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mutation for generating AI chat responses
  const generateResponseMutation = useMutation({
    mutationFn: async ({ 
      message, 
      analyzeSentiment = false 
    }: { 
      message: string, 
      analyzeSentiment?: boolean 
    }) => {
      const response = await apiRequest("POST", "/api/chat", {
        message,
        model: currentModel,
        context: messages.slice(-10).map(m => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content
        }))
      });
      
      const responseData = await response.json();
      
      // If sentiment analysis is enabled, analyze the message
      if (analyzeSentiment) {
        try {
          const sentimentResponse = await apiRequest("POST", "/api/analyze-sentiment", {
            text: message
          });
          
          const sentimentData = await sentimentResponse.json();
          return {
            ...responseData,
            sentiment: sentimentData
          };
        } catch (error) {
          console.error("Error analyzing sentiment:", error);
          return responseData;
        }
      }
      
      return responseData;
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

  // Mutation for analyzing images
  const analyzeImageMutation = useMutation({
    mutationFn: async ({ 
      imageFile, 
      prompt 
    }: { 
      imageFile: File, 
      prompt: string 
    }) => {
      // Create a FormData object to send the image file
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('prompt', prompt);
      
      // Use fetch directly for FormData
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze image');
      }
      
      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Error analyzing image",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      setIsTyping(false);
    }
  });

  // Handle sending regular text messages
  const handleSendMessage = async (content: string, imageFile?: File) => {
    if (!content.trim()) return;

    // Create a temporary URL for the image if one was provided
    const imageUrl = imageFile ? URL.createObjectURL(imageFile) : undefined;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
      imageUrl
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Generate AI response with optional sentiment analysis
      const response = await generateResponseMutation.mutateAsync({ 
        message: content,
        analyzeSentiment: isSentimentAnalysisEnabled 
      });
      
      // Construct AI response message
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: "ai",
        timestamp: new Date(),
        model: currentModel,
        sentiment: response.sentiment as SentimentAnalysis
      };

      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle sending images for analysis
  const handleSendImageForAnalysis = async (imageFile: File, prompt: string) => {
    if (!imageFile) return;
    
    // Create a temporary URL for the image
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Create user message with image
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: prompt || "Please analyze this image",
      sender: "user",
      timestamp: new Date(),
      imageUrl
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Send image for analysis
      const response = await analyzeImageMutation.mutateAsync({
        imageFile,
        prompt
      });
      
      // Create AI response with analysis
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.analysis,
        sender: "ai",
        timestamp: new Date(),
        model: currentModel,
        analysis: "Image Analysis"
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
        content: "👋 Hello! I'm your AI assistant, powered by advanced language models. I can help with information, answer questions, analyze images, perform sentiment analysis, or just chat. How can I assist you today?",
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
        onSendImageForAnalysis={handleSendImageForAnalysis}
        onClearChat={handleClearChat}
        isTyping={isTyping}
      />
    </div>
  );
}
