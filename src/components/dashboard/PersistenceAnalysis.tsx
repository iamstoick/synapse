import { RedisPerformanceMetrics } from "@/types/redis";
import { Save, FileText, Timer } from "lucide-react";
import MetricCard from "./MetricCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PersistenceAnalysisProps {
  metrics: RedisPerformanceMetrics;
}

const PersistenceAnalysis = ({ metrics }: PersistenceAnalysisProps) => {
  const persistence = metrics.persistence || {
    rdbLastSaveTime: 0,
    rdbChangesSinceLastSave: 0,
    aofCurrentSize: 0,
    aofBaseSize: 0,
    lastForkUsec: 0
  };

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatMicroseconds = (usec: number) => {
    if (usec === 0) return 'N/A';
    if (usec < 1000) return `${usec}μs`;
    if (usec < 1000000) return `${(usec / 1000).toFixed(1)}ms`;
    return `${(usec / 1000000).toFixed(2)}s`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
          <Save className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Persistence Analysis</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Data persistence and backup status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricCard
                  title="RDB Changes"
                  value={persistence.rdbChangesSinceLastSave.toLocaleString()}
                  icon={<Save className="w-5 h-5" />}
                  trend={persistence.rdbChangesSinceLastSave > 1000 ? "up" : "neutral"}
                  className="border-l-4 border-l-blue-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Number of changes to the dataset since the last RDB save. High values indicate that a significant amount of data could be lost if Redis crashes before the next backup.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricCard
                  title="AOF Size"
                  value={formatBytes(persistence.aofCurrentSize)}
                  icon={<FileText className="w-5 h-5" />}
                  trend="neutral"
                  className="border-l-4 border-l-green-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current size of the Append Only File (AOF). AOF logs every write operation and provides better durability than RDB. Large AOF files may need rewriting for optimization.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricCard
                  title="Last Fork Time"
                  value={formatMicroseconds(persistence.lastForkUsec)}
                  icon={<Timer className="w-5 h-5" />}
                  trend={persistence.lastForkUsec > 1000000 ? "up" : "neutral"}
                  className="border-l-4 border-l-orange-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Time taken for the last fork operation during RDB save or AOF rewrite. High values indicate potential performance issues during background saves.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">RDB Snapshot</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Last Save:</span>
              <span>{formatTimestamp(persistence.rdbLastSaveTime)}</span>
            </div>
            <div className="flex justify-between">
              <span>Changes Since Save:</span>
              <span className={persistence.rdbChangesSinceLastSave > 1000 ? "text-orange-600" : ""}>
                {persistence.rdbChangesSinceLastSave.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">AOF Status</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Current Size:</span>
              <span>{formatBytes(persistence.aofCurrentSize)}</span>
            </div>
            <div className="flex justify-between">
              <span>Base Size:</span>
              <span>{formatBytes(persistence.aofBaseSize)}</span>
            </div>
            {persistence.aofCurrentSize > persistence.aofBaseSize * 2 && (
              <div className="text-orange-600 dark:text-orange-400 text-xs mt-2">
                ⚠ AOF file is growing large - consider rewriting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersistenceAnalysis;
