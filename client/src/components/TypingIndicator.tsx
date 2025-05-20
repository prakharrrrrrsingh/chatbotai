import { AIModel } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

interface TypingIndicatorProps {
  model: AIModel;
}

export default function TypingIndicator({ model }: TypingIndicatorProps) {
  return (
    <div className="flex flex-col max-w-3xl mx-auto w-full">
      <div className="flex items-start mb-4">
        <Avatar className="w-8 h-8 mr-2 bg-primary text-white">
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="bg-neutral-DEFAULT dark:bg-slate-700 rounded-2xl rounded-tl-none py-3 px-6 shadow-sm dark:text-white flex items-center">
          <div className="dot-typing"></div>
        </div>
      </div>
    </div>
  );
}
