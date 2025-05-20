import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIModel } from "@/lib/types";
import { ChevronDown } from "lucide-react";

interface ModelSelectorProps {
  currentModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

const MODEL_NAMES: Record<AIModel, string> = {
  gpt: "GPT-4 Turbo",
  claude: "Claude 3 Opus",
  llama: "Llama 3",
  gemini: "Gemini Pro"
};

export default function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="relative">
      <Select 
        value={currentModel} 
        onValueChange={(value) => onModelChange(value as AIModel)}
      >
        <SelectTrigger className="w-[150px] bg-gray-100 dark:bg-slate-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-md py-1.5 px-3 h-auto">
          <SelectValue placeholder="Select AI model" />
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(MODEL_NAMES).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
