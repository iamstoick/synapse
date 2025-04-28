
import { RedisPerformanceMetrics } from "@/types/redis";
import MetricCard from "./MetricCard";
import { CircleGauge, Database, Clock3, Server, Gauge } from "lucide-react";

interface HeaderProps {
  metrics: RedisPerformanceMetrics;
}

const Header = ({ metrics }: HeaderProps) => {
  // Format response time
  const formatResponseTime = (ms: number) => {
    return `${ms.toFixed(2)} ms`;
  };
  
  // Format overall hit ratio as percentage
  const formatHitRatio = (ratio: number) => {
    return `${(ratio * 100).toFixed(1)}%`;
  };

  // Format CPU utilization
  const formatCpuUtilization = (cpu?: number) => {
    return cpu ? `${cpu.toFixed(1)}%` : 'N/A';
  };

  // Format memory values with fallback
  const formatMemory = () => {
    if (!metrics.memoryUsage) {
      return 'N/A';
    }
    const used = metrics.memoryUsage.used || 0;
    const total = metrics.memoryUsage.total || 0;
    return `${used} / ${total} MB`;
  };
  
  // Safely get total requests with fallback
  const getTotalRequests = () => {
    return metrics.totalRequests != null ? metrics.totalRequests.toLocaleString() : '0';
  };
  
  return (
    <div className="mb-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Redis Performance Monitor</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time cache performance metrics across all levels
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
        <MetricCard 
          title="Overall Hit Ratio"
          value={formatHitRatio(metrics.overallHitRatio || 0)}
          icon={<CircleGauge className="h-5 w-5" />}
        />
        
        <MetricCard 
          title="Total Requests"
          value={getTotalRequests()}
          icon={<Database className="h-5 w-5" />}
        />
        
        <MetricCard 
          title="Avg Response Time"
          value={formatResponseTime(metrics.avgResponseTime || 0)}
          icon={<Clock3 className="h-5 w-5" />}
        />
        
        <MetricCard 
          title="Memory Used"
          value={formatMemory()}
          icon={<Server className="h-5 w-5" />}
        />

        <MetricCard 
          title="CPU Utilization"
          value={formatCpuUtilization(metrics.cpuUtilization)}
          icon={<Gauge className="h-5 w-5" />}
        />
      </div>
    </div>
  );
};

export default Header;
