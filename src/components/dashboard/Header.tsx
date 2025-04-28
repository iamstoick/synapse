
import { RedisPerformanceMetrics } from "@/types/redis";
import MetricCard from "./MetricCard";
import { CircleGauge, Database, Clock3, Server, Gauge, Cpu, Memory, Scale, Calendar } from "lucide-react";

interface HeaderProps {
  metrics: RedisPerformanceMetrics;
}

const Header = ({ metrics }: HeaderProps) => {
  const formatResponseTime = (ms: number) => {
    return `${ms.toFixed(2)} ms`;
  };
  
  const formatHitRatio = (ratio: number) => {
    return `${(ratio * 100).toFixed(1)}%`;
  };

  const formatCpuUtilization = (cpu?: number) => {
    return cpu ? `${cpu.toFixed(1)}%` : 'N/A';
  };

  const formatMemory = (value?: string) => {
    return value || 'N/A';
  };
  
  const formatNumber = (value?: number) => {
    return value?.toLocaleString() ?? 'N/A';
  };

  const formatRatio = (ratio?: number) => {
    return ratio ? ratio.toFixed(2) : 'N/A';
  };

  return (
    <div className="mb-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Redis Performance Monitor</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time cache performance metrics across all levels
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <MetricCard 
          title="Database Size"
          value={formatNumber(metrics.dbSize)}
          icon={<Database className="h-5 w-5" />}
        />

        <MetricCard 
          title="Keyspace Hits"
          value={formatNumber(metrics.keyspaceHits)}
          icon={<CircleGauge className="h-5 w-5" />}
        />

        <MetricCard 
          title="Keyspace Misses"
          value={formatNumber(metrics.keyspaceMisses)}
          icon={<CircleGauge className="h-5 w-5" />}
        />

        <MetricCard 
          title="CPU Usage (System)"
          value={formatCpuUtilization(metrics.usedCpuSys)}
          icon={<Cpu className="h-5 w-5" />}
        />

        <MetricCard 
          title="Memory Used"
          value={formatMemory(metrics.usedMemoryHuman)}
          icon={<Memory className="h-5 w-5" />}
        />

        <MetricCard 
          title="Peak Memory"
          value={formatMemory(metrics.usedMemoryPeakHuman)}
          icon={<Memory className="h-5 w-5" />}
        />

        <MetricCard 
          title="Memory Fragmentation"
          value={formatRatio(metrics.memFragmentationRatio)}
          icon={<Scale className="h-5 w-5" />}
        />

        <MetricCard 
          title="Uptime (Days)"
          value={formatNumber(metrics.uptimeInDays)}
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>
    </div>
  );
};

export default Header;
