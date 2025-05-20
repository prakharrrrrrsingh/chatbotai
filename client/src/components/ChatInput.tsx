import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  PaperclipIcon, 
  MicOff, 
  TrashIcon, 
  BrainCircuit, 
  ShieldCheck, 
  SendIcon,
  ImageIcon,
  FileUpIcon,
  XIcon,
  BarChart2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ChatInputProps {
  onSendMessage: (message: string, imageFile?: File) => void;
  onSendImageForAnalysis: (imageFile: File, prompt: string) => void;
  onClearChat: () => void;
  isTyping: boolean;
}

export default function ChatInput({ 
  onSendMessage, 
  onSendImageForAnalysis, 
  onClearChat, 
  isTyping 
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isSentimentAnalysisActive, setIsSentimentAnalysisActive] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image size must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setImageFile(file);
      setShowImagePrompt(true);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setShowImagePrompt(false);
    setImagePrompt("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) return;
    
    setIsAnalyzingImage(true);
    
    try {
      // If we're in image analysis mode, send the image for analysis
      onSendImageForAnalysis(imageFile, imagePrompt || "Analyze this image in detail.");
      
      // Reset after sending
      setImageFile(null);
      setShowImagePrompt(false);
      setImagePrompt("");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Error analyzing image",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there's an image and we're not in analysis mode, send message with image
    if (imageFile && !showImagePrompt && message.trim() && !isTyping) {
      onSendMessage(message, imageFile);
      setMessage("");
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      return;
    }
    
    // Regular text message
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

  // Toggle sentiment analysis mode
  const toggleSentimentAnalysis = () => {
    setIsSentimentAnalysisActive(!isSentimentAnalysisActive);
    toast({
      title: isSentimentAnalysisActive ? "Sentiment analysis disabled" : "Sentiment analysis enabled",
      description: isSentimentAnalysisActive 
        ? "Responses will no longer include sentiment analysis" 
        : "AI will analyze the sentiment of your messages",
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-3xl mx-auto">
        {/* Image upload preview */}
        {imageFile && (
          <div className="mb-3 p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <ImageIcon className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm font-medium">Image attached</span>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={handleRemoveImage}
                className="h-6 w-6 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600"
              >
                <XIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </div>
            
            <div className="relative">
              <img 
                src={URL.createObjectURL(imageFile)} 
                alt="Uploaded preview" 
                className="max-h-40 rounded-md object-contain mx-auto"
              />
            </div>
            
            {/* Image analysis prompt input */}
            {showImagePrompt && (
              <div className="mt-2">
                <div className="flex flex-col space-y-2">
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={2}
                    placeholder="What would you like to know about this image? (optional)"
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm resize-none focus:ring-primary focus:border-primary dark:text-white"
                  />
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowImagePrompt(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={handleAnalyzeImage}
                      disabled={isAnalyzingImage}
                      className="text-xs ml-auto"
                    >
                      {isAnalyzingImage ? "Analyzing..." : "Analyze Image"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-2xl px-3 py-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={isSentimentAnalysisActive ? "Type your message for sentiment analysis..." : "Type your message..."}
              className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-sm resize-none max-h-32 dark:text-white"
              disabled={isTyping || isAnalyzingImage}
            />
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex space-x-1">
                {/* File upload button */}
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PaperclipIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*"
                />
                
                {/* Sentiment analysis toggle */}
                <Button 
                  type="button" 
                  variant={isSentimentAnalysisActive ? "default" : "ghost"}
                  size="sm" 
                  className={`p-1.5 rounded-full ${isSentimentAnalysisActive ? 'bg-primary text-white' : 'hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-400'}`}
                  onClick={toggleSentimentAnalysis}
                >
                  <BarChart2 className="h-4 w-4" />
                </Button>
                
                {/* Voice input (disabled) */}
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
            disabled={(!message.trim() && !imageFile) || isTyping || isAnalyzingImage}
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
          {isSentimentAnalysisActive && (
            <div className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-1.5 text-primary" />
              <span>Sentiment analysis</span>
            </div>
          )}
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
