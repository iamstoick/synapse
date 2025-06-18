
import { RedisPerformanceMetrics } from "@/types/redis";
import { Cpu, Activity } from "lucide-react";
import MetricCard from "./MetricCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface CpuUsageProps {
  metrics: RedisPerformanceMetrics;
}

const CpuUsage = ({ metrics }: CpuUsageProps) => {
  const cpuUsage = metrics.cpuUsage || {
    usedCpuSys: 0,
    usedCpuUser: 0,
    instantaneousCpuPercentage: 0
  };

  const getCpuStatus = (percentage: number) => {
    if (percentage > 80) return { color: "text-red-600", status: "High" };
    if (percentage > 50) return { color: "text-orange-600", status: "Medium" };
    return { color: "text-green-600", status: "Low" };
  };

  const cpuStatus = getCpuStatus(cpuUsage.instantaneousCpuPercentage);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
          <Cpu className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">CPU Usage</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Redis CPU utilization metrics showing system and user CPU time</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricCard
                  title="System CPU Time"
                  value={`${cpuUsage.usedCpuSys.toFixed(2)}s`}
                  icon={<Cpu className="w-5 h-5" />}
                  trend="neutral"
                  className="border-l-4 border-l-red-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cumulative CPU time spent in system/kernel mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricCard
                  title="User CPU Time"
                  value={`${cpuUsage.usedCpuUser.toFixed(2)}s`}
                  icon={<Activity className="w-5 h-5" />}
                  trend="neutral"
                  className="border-l-4 border-l-blue-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cumulative CPU time spent in user mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricCard
                  title="CPU Usage"
                  value={`${cpuUsage.instantaneousCpuPercentage.toFixed(2)}%`}
                  icon={<Cpu className="w-5 h-5" />}
                  trend={cpuUsage.instantaneousCpuPercentage > 50 ? "up" : "neutral"}
                  trendValue={cpuStatus.status}
                  className="border-l-4 border-l-green-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Average CPU usage percentage for the Redis process</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">CPU Analysis</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Total CPU Time:</span>
            <span>{(cpuUsage.usedCpuSys + cpuUsage.usedCpuUser).toFixed(2)}s</span>
          </div>
          <div className="flex justify-between">
            <span>CPU Status:</span>
            <span className={cpuStatus.color}>{cpuStatus.status}</span>
          </div>
          <div className="flex justify-between">
            <span>Efficiency:</span>
            <span>{cpuUsage.instantaneousCpuPercentage < 50 ? 'Good' : cpuUsage.instantaneousCpuPercentage < 80 ? 'Moderate' : 'High'}</span>
          </div>
          {cpuUsage.instantaneousCpuPercentage > 80 && (
            <div className="text-orange-600 dark:text-orange-400 text-xs mt-2">
              ⚠ High CPU usage detected - consider optimizing queries or scaling
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CpuUsage;
