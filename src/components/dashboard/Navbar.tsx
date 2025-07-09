
import { RefreshCw, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface NavbarProps {
  onRefresh: () => void;
  lastUpdated: Date;
}

const Navbar = ({ onRefresh, lastUpdated }: NavbarProps) => {
  const { user, signOut } = useAuth();
  
  const formattedTime = lastUpdated.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };
  
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;
