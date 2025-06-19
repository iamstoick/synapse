
import { RedisPerformanceMetrics } from "@/types/redis";
import MetricCard from "./MetricCard";
import { CircleGauge, Database, Clock3, Calendar, Server, Cpu, HardDrive, BarChart3, TrendingUp, Activity } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderProps {
  metrics: RedisPerformanceMetrics;
}

const Header = ({ metrics }: HeaderProps) => {
  const formatHitRatio = (ratio: number) => {
    return `${(ratio * 100).toFixed(2)}%`;
  };

  const formatNumber = (value?: number) => {
    return value?.toLocaleString() ?? 'N/A';
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatResponseTime = (time: number) => {
    return `${time.toFixed(2)}ms`;
  };

  return (
    <div className="mb-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Redis Performance Monitor</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Real-time cache performance metrics and health assessment
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <MetricCard 
                    title="Overall Cache Hit Ratio"
                    value={formatHitRatio(metrics.overallHitRatio)}
                    icon={<CircleGauge className="h-6 w-6" />}
                    className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Percentage of cache requests that were served from memory vs disk. Higher is better (greater than 90% is excellent)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <MetricCard 
                    title="Database Size"
                    value={formatNumber(metrics.dbSize)}
                    icon={<Database className="h-6 w-6" />}
                    className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total number of keys stored in the selected Redis database</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <MetricCard 
                    title="Response Time"
                    value={formatResponseTime(metrics.avgResponseTime)}
                    icon={<Clock3 className="h-6 w-6" />}
                    className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Average latency for Redis commands. Lower is better (less than 1ms is excellent)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <MetricCard 
                    title="Uptime"
                    value={formatUptime(metrics.uptimeInSeconds)}
                    icon={<Calendar className="h-6 w-6" />}
                    className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>How long Redis has been running since the last restart</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Operations & Performance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <MetricCard 
                      title="Total Commands Processed"
                      value={formatNumber(metrics.totalRequests)}
                      icon={<Server className="h-5 w-5" />}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total number of commands processed since Redis startup</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <MetricCard 
                      title="Instantaneous Ops/Sec"
                      value={`${formatNumber(metrics.instantaneousOpsPerSec)}/sec`}
                      icon={<Activity className="h-5 w-5" />}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current operations per second. Indicates current load on Redis</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <MetricCard 
                      title="CPU Usage"
                      value={`${(metrics.cpuUtilization || 0).toFixed(2)}s`}
                      icon={<Cpu className="h-5 w-5" />}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cumulative CPU time used by Redis process in system mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <MetricCard 
                      title="Memory Used"
                      value={`${metrics.memoryUsage.used}MB`}
                      icon={<HardDrive className="h-5 w-5" />}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current memory usage by Redis in megabytes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Operation Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <MetricCard 
                      title="Read Operations"
                      value={formatNumber(metrics.operations.reads)}
                      icon={<Server className="h-5 w-5" />}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total number of read operations (GET, MGET, HGET, etc.)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <MetricCard 
                      title="Write Operations"
                      value={formatNumber(metrics.operations.writes)}
                      icon={<Server className="h-5 w-5" />}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total number of write operations (SET, MSET, HSET, etc.)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <MetricCard 
                      title="Delete Operations"
                      value={formatNumber(metrics.operations.deletes)}
                      icon={<Server className="h-5 w-5" />}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total number of delete operations (DEL, UNLINK, etc.)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Keyspace Statistics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <MetricCard 
                      title="Keyspace Hits"
                      value={formatNumber(metrics.keyspaceHits)}
                      icon={<TrendingUp className="h-5 w-5" />}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of successful lookups of keys in the main dictionary</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <MetricCard 
                      title="Keyspace Misses"
                      value={formatNumber(metrics.keyspaceMisses)}
                      icon={<BarChart3 className="h-5 w-5" />}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of failed lookups of keys in the main dictionary. High miss rates may indicate inefficient cache usage or frequent requests for non-existent keys.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
