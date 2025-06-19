
import { RedisPerformanceMetrics } from "@/types/redis";
import { Save, FileText, Timer, HardDrive, Percent, Clock, Activity } from "lucide-react";
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
    lastForkUsec: 0,
    rdbLastBgsaveTimeSec: 0,
    currentCowSize: 0,
    currentForkPerc: 0,
    rdbLastCowSize: 0,
    rdbBgsaveInProgress: 0
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

  const formatSeconds = (seconds: number) => {
    if (seconds === 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatMicroseconds = (usec: number) => {
    if (usec === 0) return 'N/A';
    if (usec < 1000) return `${usec}μs`;
    if (usec < 1000000) return `${(usec / 1000).toFixed(1)}ms`;
    return `${(usec / 1000000).toFixed(2)}s`;
  };

  const formatPercentage = (percent: number) => {
    if (percent === 0) return 'N/A';
    return `${percent.toFixed(1)}%`;
  };

  const formatBgsaveInProgress = (inProgress: number) => {
    return inProgress === 1 ? 'Yes' : 'No';
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                  title="Current Fork In Progress"
                  value={formatBgsaveInProgress(persistence.rdbBgsaveInProgress || 0)}
                  icon={<Activity className="w-5 h-5" />}
                  trend={persistence.rdbBgsaveInProgress === 1 ? "up" : "neutral"}
                  className="border-l-4 border-l-green-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Indicates whether an RDB background save is currently in progress. When active, Redis is creating a snapshot of the data to disk.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricCard
                  title="Last Fork Time"
                  value={formatSeconds(persistence.rdbLastBgsaveTimeSec || 0)}
                  icon={<Clock className="w-5 h-5" />}
                  trend={persistence.rdbLastBgsaveTimeSec && persistence.rdbLastBgsaveTimeSec > 60 ? "up" : "neutral"}
                  className="border-l-4 border-l-orange-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Time taken for the last background RDB save operation. High values indicate potential performance issues during background saves.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricCard
                  title="Current Fork Memory Usage"
                  value={formatBytes(persistence.currentCowSize || 0)}
                  icon={<HardDrive className="w-5 h-5" />}
                  trend="neutral"
                  className="border-l-4 border-l-purple-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current Copy-on-Write memory usage during the ongoing RDB save. This represents how much extra memory Redis is using right now for the fork.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricCard
                  title="Current Fork Percentage"
                  value={formatPercentage(persistence.currentForkPerc || 0)}
                  icon={<Percent className="w-5 h-5" />}
                  trend="neutral"
                  className="border-l-4 border-l-indigo-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Percentage of the fork process completed.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricCard
                  title="Last Fork Memory Usage"
                  value={formatBytes(persistence.rdbLastCowSize || 0)}
                  icon={<Timer className="w-5 h-5" />}
                  trend="neutral"
                  className="border-l-4 border-l-cyan-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy-on-Write memory used during the last completed RDB save.</p>
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
            <div className="flex justify-between">
              <span>Last Save Duration:</span>
              <span>{formatSeconds(persistence.rdbLastBgsaveTimeSec || 0)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Fork Status</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Current Fork Progress:</span>
              <span>{formatPercentage(persistence.currentForkPerc || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Current COW Memory:</span>
              <span>{formatBytes(persistence.currentCowSize || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Fork COW Memory:</span>
              <span>{formatBytes(persistence.rdbLastCowSize || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersistenceAnalysis;
