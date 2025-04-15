
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavbarProps {
  onRefresh: () => void;
  lastUpdated: Date;
}

const Navbar = ({ onRefresh, lastUpdated }: NavbarProps) => {
  const formattedTime = lastUpdated.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  return (
    <div className="bg-background border-b border-border py-3 px-4 flex justify-between items-center mb-6">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
          <span className="font-bold">R</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800">Redis Cache Oracle</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          Last updated: {formattedTime}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navbar;
