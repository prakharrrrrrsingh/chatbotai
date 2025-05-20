import { AIModel } from "@/lib/types";
import { Bot } from "lucide-react";
import ModelSelector from "./ModelSelector";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface ChatHeaderProps {
  currentModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

export default function ChatHeader({ currentModel, onModelChange }: ChatHeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm py-3 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
          <Bot size={20} />
        </div>
        <div>
          <h1 className="font-semibold text-lg">AI Assistant</h1>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span>Online and ready to help</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <ModelSelector 
          currentModel={currentModel} 
          onModelChange={onModelChange} 
        />
        
        <ThemeToggle />
        
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Settings">
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Button>
      </div>
    </header>
  );
}
