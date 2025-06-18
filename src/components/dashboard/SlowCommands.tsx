
import { RedisPerformanceMetrics } from "@/types/redis";
import { Clock } from "lucide-react";

interface SlowCommandsProps {
  metrics: RedisPerformanceMetrics;
}

const SlowCommands = ({ metrics }: SlowCommandsProps) => {
  const slowlog = metrics.slowlog || [];

  const formatDuration = (microseconds: number) => {
    if (microseconds >= 1000000) {
      return `${(microseconds / 1000000).toFixed(2)}s`;
    } else if (microseconds >= 1000) {
      return `${(microseconds / 1000).toFixed(2)}ms`;
    } else {
      return `${microseconds}μs`;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatCommand = (command: string[] | string) => {
    if (Array.isArray(command)) {
      return command.join(' ');
    }
    return String(command);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
          <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Slow Commands</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Recent slow-running commands</p>
        </div>
      </div>

      {slowlog && slowlog.length > 0 ? (
        <div className="space-y-3">
          {slowlog.map((entry, index) => (
            <div key={entry.id || index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Command #{entry.id}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  {formatDuration(entry.duration)}
                </div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-mono bg-gray-100 dark:bg-gray-600 p-2 rounded break-all">
                {formatCommand(entry.command)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimestamp(entry.timestamp)}
                {entry.clientIp && ` • Client: ${entry.clientIp}`}
                {entry.clientName && ` • Name: ${entry.clientName}`}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No slow commands recorded</p>
            <p className="text-xs mt-1">Commands taking longer than slowlog-log-slower-than threshold</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlowCommands;
