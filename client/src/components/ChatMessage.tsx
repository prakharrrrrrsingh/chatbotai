import { ChatMessage as ChatMessageType, SentimentAnalysis } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, BarChart2, ImageIcon, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { content, sender, model, imageUrl, analysis, sentiment } = message;
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  
  if (sender === "user") {
    return (
      <div className="message-enter flex flex-col max-w-3xl mx-auto w-full">
        <div className="flex items-start justify-end mb-4">
          <div className="bg-primary-light text-white rounded-2xl rounded-tr-none py-3 px-4 max-w-[85%] shadow-sm">
            <p className="text-sm whitespace-pre-wrap">{content}</p>
            
            {/* Show uploaded image if any */}
            {imageUrl && (
              <div className="mt-3">
                <img 
                  src={imageUrl} 
                  alt="User uploaded" 
                  className="max-w-full rounded-lg max-h-64 object-contain"
                />
              </div>
            )}
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
    "gpt": "GPT-4o",
    "claude": "Claude 3 Opus",
    "llama": "Llama 3",
    "gemini": "Gemini Pro"
  };

  // Generate sentiment badge and color based on sentiment analysis
  const getSentimentBadge = (sentimentData: SentimentAnalysis) => {
    const { sentiment, score } = sentimentData;
    
    let bgColor = "bg-gray-200 text-gray-700";
    let icon = <AlertCircle className="w-3 h-3 mr-1" />;
    
    if (sentiment === "positive") {
      bgColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      icon = <div className="w-3 h-3 mr-1">😊</div>;
    } else if (sentiment === "negative") {
      bgColor = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      icon = <div className="w-3 h-3 mr-1">😞</div>;
    } else {
      bgColor = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      icon = <div className="w-3 h-3 mr-1">😐</div>;
    }
    
    return (
      <div className="mt-2">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
          {icon}
          {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} ({score.toFixed(2)})
        </div>
        {showFullAnalysis && (
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
            {sentimentData.explanation}
          </div>
        )}
        {!showFullAnalysis && sentimentData.explanation && (
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs p-0 h-auto mt-1 text-gray-500 dark:text-gray-400" 
            onClick={() => setShowFullAnalysis(true)}
          >
            Show explanation
          </Button>
        )}
      </div>
    );
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
          {/* Image analysis badge */}
          {analysis && (
            <div className="mb-2">
              <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-100 border-purple-200 dark:border-purple-800">
                <ImageIcon className="h-3 w-3" /> Image Analysis
              </Badge>
            </div>
          )}
          
          {/* Regular message content */}
          <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMessage(content) }}></div>
          
          {/* Sentiment analysis result */}
          {sentiment && getSentimentBadge(sentiment)}
          
          {/* Message source model */}
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
  
  // Convert markdown-style links: [title](url)
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-primary hover:underline">$1</a>');
  
  // Convert bullet points
  formatted = formatted.replace(/^- (.+)$/gm, '• $1');
  
  return formatted;
}
