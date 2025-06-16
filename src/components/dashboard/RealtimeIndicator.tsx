
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtimeIndicatorProps {
  isConnected: boolean;
  lastUpdate?: Date;
}

const RealtimeIndicator = ({ isConnected, lastUpdate }: RealtimeIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        isConnected 
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
      )}>
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Live</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Offline</span>
          </>
        )}
      </div>
      {lastUpdate && (
        <span className="text-xs text-gray-500">
          Updated {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default RealtimeIndicator;
