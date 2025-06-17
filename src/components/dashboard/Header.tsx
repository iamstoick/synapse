
import { RedisPerformanceMetrics } from "@/types/redis";
import MetricCard from "./MetricCard";
import { CircleGauge, Database, Clock3, Server, Gauge, Cpu, HardDrive, Scale, Calendar, Activity, BarChart3, TrendingUp } from "lucide-react";

interface HeaderProps {
  metrics: RedisPerformanceMetrics;
}

const Header = ({ metrics }: HeaderProps) => {
  const formatHitRatio = (ratio: number) => {
    return `${(ratio * 100).toFixed(2)}%`;
  };

  const formatCpuSeconds = (cpu?: number) => {
    return cpu ? `${cpu.toFixed(2)}s` : 'N/A';
  };

  const formatNumber = (value?: number) => {
    return value?.toLocaleString() ?? 'N/A';
  };

  const formatOpsPerSec = (ops?: number) => {
    return ops ? `${ops.toLocaleString()}/sec` : 'N/A';
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

  return (
    <div className="mb-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Redis Performance Monitor</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time cache performance metrics and health assessment
        </p>
      </div>
      
      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <MetricCard 
          title="Overall Cache Hit Ratio"
          value={formatHitRatio(metrics.overallHitRatio)}
          icon={<CircleGauge className="h-5 w-5" />}
        />

        <MetricCard 
          title="Total Commands Processed"
          value={formatNumber(metrics.totalRequests)}
          icon={<Database className="h-5 w-5" />}
        />

        <MetricCard 
          title="Instantaneous Ops/Sec"
          value={formatOpsPerSec(metrics.instantaneousOpsPerSec)}
          icon={<Activity className="h-5 w-5" />}
        />

        <MetricCard 
          title="CPU Usage"
          value={formatCpuSeconds(metrics.cpuUtilization)}
          icon={<Cpu className="h-5 w-5" />}
        />
      </div>

      {/* Operations Breakdown Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <MetricCard 
          title="Read Operations"
          value={formatNumber(metrics.operations.reads)}
          icon={<Server className="h-5 w-5" />}
        />

        <MetricCard 
          title="Write Operations"
          value={formatNumber(metrics.operations.writes)}
          icon={<Server className="h-5 w-5" />}
        />

        <MetricCard 
          title="Delete Operations"
          value={formatNumber(metrics.operations.deletes)}
          icon={<Server className="h-5 w-5" />}
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <MetricCard 
          title="Database Size"
          value={formatNumber(metrics.dbSize)}
          icon={<HardDrive className="h-5 w-5" />}
        />

        <MetricCard 
          title="Keyspace Hits"
          value={formatNumber(metrics.keyspaceHits)}
          icon={<TrendingUp className="h-5 w-5" />}
        />

        <MetricCard 
          title="Keyspace Misses"
          value={formatNumber(metrics.keyspaceMisses)}
          icon={<BarChart3 className="h-5 w-5" />}
        />

        <MetricCard 
          title="Uptime"
          value={formatUptime(metrics.uptimeInSeconds)}
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>
    </div>
  );
};

export default Header;
