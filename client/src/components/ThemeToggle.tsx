import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button 
      onClick={toggleTheme} 
      variant="ghost" 
      size="icon" 
      className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-slate-700"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600" />
      )}
    </Button>
  );
}
