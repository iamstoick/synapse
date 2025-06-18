
import { RedisPerformanceMetrics } from "@/types/redis";
import { Database, Trash2, AlertTriangle } from "lucide-react";
import MetricCard from "./MetricCard";

interface MemoryAnalysisProps {
  metrics: RedisPerformanceMetrics;
}

const MemoryAnalysis = ({ metrics }: MemoryAnalysisProps) => {
  const memoryAnalysis = metrics.memoryAnalysis || {
    fragmentationRatio: 0,
    evictedKeys: 0,
    expiredKeys: 0
  };

  const getFragmentationStatus = (ratio: number) => {
    if (ratio > 1.5) return { color: "text-red-600", status: "High" };
    if (ratio > 1.2) return { color: "text-orange-600", status: "Medium" };
    return { color: "text-green-600", status: "Good" };
  };

  const fragmentationStatus = getFragmentationStatus(memoryAnalysis.fragmentationRatio);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
          <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Memory Analysis</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Memory efficiency and management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Memory Fragmentation"
          value={memoryAnalysis.fragmentationRatio.toFixed(2)}
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={memoryAnalysis.fragmentationRatio > 1.2 ? "up" : "neutral"}
          trendValue={fragmentationStatus.status}
          className="border-l-4 border-l-purple-500"
        />
        
        <MetricCard
          title="Evicted Keys"
          value={memoryAnalysis.evictedKeys.toLocaleString()}
          icon={<Trash2 className="w-5 h-5" />}
          trend={memoryAnalysis.evictedKeys > 0 ? "up" : "neutral"}
          className="border-l-4 border-l-red-500"
        />
        
        <MetricCard
          title="Expired Keys"
          value={memoryAnalysis.expiredKeys.toLocaleString()}
          icon={<Database className="w-5 h-5" />}
          trend="neutral"
          className="border-l-4 border-l-blue-500"
        />
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Analysis</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Fragmentation Status:</span>
            <span className={fragmentationStatus.color}>{fragmentationStatus.status}</span>
          </div>
          <div className="flex justify-between">
            <span>Memory Efficiency:</span>
            <span>{((1 / Math.max(memoryAnalysis.fragmentationRatio, 0.1)) * 100).toFixed(1)}%</span>
          </div>
          {memoryAnalysis.evictedKeys > 0 && (
            <div className="text-orange-600 dark:text-orange-400 text-xs mt-2">
              ⚠ Keys are being evicted - consider increasing memory or reviewing TTL policies
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryAnalysis;
