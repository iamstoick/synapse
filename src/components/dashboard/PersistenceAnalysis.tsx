
import { RedisPerformanceMetrics } from "@/types/redis";
import { HardDrive, Clock, FileText } from "lucide-react";
import MetricCard from "./MetricCard";

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

  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return "Never";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatMicroseconds = (microseconds: number) => {
    if (microseconds >= 1000000) {
      return `${(microseconds / 1000000).toFixed(2)}s`;
    } else if (microseconds >= 1000) {
      return `${(microseconds / 1000).toFixed(2)}ms`;
    } else {
      return `${microseconds}μs`;
    }
  };

  const aofGrowth = persistence.aofBaseSize > 0 
    ? ((persistence.aofCurrentSize - persistence.aofBaseSize) / persistence.aofBaseSize * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
          <HardDrive className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Persistence & Disk I/O</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">RDB and AOF performance metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="RDB Changes"
          value={persistence.rdbChangesSinceLastSave.toLocaleString()}
          icon={<FileText className="w-5 h-5" />}
          trend={persistence.rdbChangesSinceLastSave > 1000 ? "up" : "neutral"}
          className="border-l-4 border-l-blue-500"
        />
        
        <MetricCard
          title="AOF Size"
          value={formatFileSize(persistence.aofCurrentSize)}
          icon={<HardDrive className="w-5 h-5" />}
          trend={aofGrowth > 20 ? "up" : "neutral"}
          trendValue={aofGrowth > 0 ? `+${aofGrowth.toFixed(1)}%` : ""}
          className="border-l-4 border-l-green-500"
        />
        
        <MetricCard
          title="Last Fork Time"
          value={formatMicroseconds(persistence.lastForkUsec)}
          icon={<Clock className="w-5 h-5" />}
          trend={persistence.lastForkUsec > 100000 ? "up" : "neutral"}
          className="border-l-4 border-l-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">RDB Performance</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Last Save:</span>
              <span>{formatTime(persistence.rdbLastSaveTime)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Changes:</span>
              <span>{persistence.rdbChangesSinceLastSave.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">AOF Performance</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Current Size:</span>
              <span>{formatFileSize(persistence.aofCurrentSize)}</span>
            </div>
            <div className="flex justify-between">
              <span>Base Size:</span>
              <span>{formatFileSize(persistence.aofBaseSize)}</span>
            </div>
            {aofGrowth > 0 && (
              <div className="flex justify-between">
                <span>Growth:</span>
                <span className={aofGrowth > 50 ? "text-red-600" : "text-green-600"}>
                  +{aofGrowth.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersistenceAnalysis;
