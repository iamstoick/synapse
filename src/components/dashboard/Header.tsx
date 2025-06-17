
import { RedisPerformanceMetrics } from "@/types/redis";
import MetricCard from "./MetricCard";
import { CircleGauge, Database, Clock3, Server, Gauge, Cpu, HardDrive, Scale, Calendar, Activity } from "lucide-react";

interface HeaderProps {
  metrics: RedisPerformanceMetrics;
}

const Header = ({ metrics }: HeaderProps) => {
  const formatHitRatio = (ratio: number) => {
    return `${(ratio * 100).toFixed(2)}%`;
  };

  const formatCpuUtilization = (cpu?: number) => {
    return cpu ? `${cpu.toFixed(2)}%` : 'N/A';
  };

  const formatNumber = (value?: number) => {
    return value?.toLocaleString() ?? 'N/A';
  };

  const formatOpsPerSec = (ops?: number) => {
    return ops ? `${ops.toLocaleString()}/sec` : 'N/A';
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
          value={formatCpuUtilization(metrics.cpuUtilization)}
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
    </div>
  );
};

export default Header;
