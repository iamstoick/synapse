import { RedisPerformanceMetrics } from "@/types/redis";
import { Info, Check, Clock, AlertCircle, TrendingUp, TrendingDown, Activity, Zap, Shield, Target } from "lucide-react";

interface InfoPanelProps {
  metrics: RedisPerformanceMetrics;
}

const InfoPanel = ({ metrics }: InfoPanelProps) => {
  // Enhanced health score calculation
  const calculateHealthScore = (ratio: number, responseTime: number, cpuSeconds: number, opsPerSec: number) => {
    // Hit ratio score (40% weight)
    const hitRatioScore = ratio * 100;
    
    // Response time score (25% weight) - penalize high response times more severely
    const responseTimeScore = Math.max(0, 100 - Math.pow(responseTime, 1.5));
    
    // CPU seconds score (25% weight) - lower CPU seconds are better
    let cpuScore = 100;
    if (cpuSeconds > 1000) {
      cpuScore = Math.max(0, 100 - (cpuSeconds / 1000) * 10);
    } else if (cpuSeconds < 10) {
      cpuScore = 80; // Very low CPU might indicate underutilization
    }
    
    // Operations throughput score (10% weight) - higher is generally better up to a point
    const opsScore = Math.min(100, (opsPerSec / 1000) * 20); // Scale based on ops/sec
    
    const weightedScore = (hitRatioScore * 0.4) + (responseTimeScore * 0.25) + (cpuScore * 0.25) + (opsScore * 0.1);
    
    return Math.round(Math.max(0, Math.min(100, weightedScore)));
  };
  
  const healthScore = calculateHealthScore(
    metrics.overallHitRatio, 
    metrics.avgResponseTime, 
    metrics.cpuUtilization || 0,
    metrics.instantaneousOpsPerSec || 0
  );
  
  // Determine health status with more nuanced assessment
  let healthStatus = "Excellent";
  let healthColor = "text-green-500";
  let healthBgColor = "bg-green-50 dark:bg-green-900/20";
  let healthBorderColor = "border-green-200 dark:border-green-800";
  let healthIcon = Check;
  let statusDescription = "";
  
  if (healthScore < 30) {
    healthStatus = "Critical";
    healthColor = "text-red-600";
    healthBgColor = "bg-red-50 dark:bg-red-900/20";
    healthBorderColor = "border-red-200 dark:border-red-800";
    healthIcon = AlertCircle;
    statusDescription = "Immediate attention required";
  } else if (healthScore < 50) {
    healthStatus = "Poor";
    healthColor = "text-red-500";
    healthBgColor = "bg-red-50 dark:bg-red-900/20";
    healthBorderColor = "border-red-200 dark:border-red-800";
    healthIcon = TrendingDown;
    statusDescription = "Performance issues detected";
  } else if (healthScore < 65) {
    healthStatus = "Below Average";
    healthColor = "text-orange-500";
    healthBgColor = "bg-orange-50 dark:bg-orange-900/20";
    healthBorderColor = "border-orange-200 dark:border-orange-800";
    healthIcon = Clock;
    statusDescription = "Room for improvement";
  } else if (healthScore < 80) {
    healthStatus = "Good";
    healthColor = "text-blue-500";
    healthBgColor = "bg-blue-50 dark:bg-blue-900/20";
    healthBorderColor = "border-blue-200 dark:border-blue-800";
    healthIcon = TrendingUp;
    statusDescription = "Performing well";
  } else if (healthScore < 90) {
    healthStatus = "Very Good";
    healthColor = "text-green-400";
    healthBgColor = "bg-green-50 dark:bg-green-900/20";
    healthBorderColor = "border-green-200 dark:border-green-800";
    healthIcon = Check;
    statusDescription = "Strong performance";
  } else {
    healthStatus = "Excellent";
    healthColor = "text-green-600";
    healthBgColor = "bg-green-50 dark:bg-green-900/20";
    healthBorderColor = "border-green-200 dark:border-green-800";
    healthIcon = Check;
    statusDescription = "Optimal performance";
  }
  
  // Enhanced performance insights with workload analysis
  const getPerformanceInsights = () => {
    const insights = [];
    const hits = metrics.keyspaceHits || 0;
    const misses = metrics.keyspaceMisses || 0;
    const totalOps = metrics.totalRequests;
    const memUsagePercent = (metrics.memoryUsage.used / metrics.memoryUsage.total) * 100;
    const opsPerSec = metrics.instantaneousOpsPerSec || 0;
    const fragmentationRatio = metrics.memoryAnalysis?.fragmentationRatio || 1.0;
    
    // Memory Fragmentation Analysis - HIGH PRIORITY
    if (fragmentationRatio > 1.5) {
      insights.push({
        type: "warning",
        icon: "💾",
        title: "Critical Memory Fragmentation",
        message: (
          <>
            Memory fragmentation is higher than 1.5. This indicates excessive memory fragmentation. A large portion of the physical RAM is being wasted. This can lead to:
            <br /><br />
            - <b>Premature OOM errors:</b> The application might hit the maxmemory limit (based on used_memory_rss) sooner than expected, even if used_memory is low.
            <br /><br />
            - <b>Increased swap usage:</b> If the OS runs out of physical RAM, it might start swapping Redis's fragmented memory to disk, leading to drastic performance degradation.
            <br /><br />
            - <b>Slower performance:</b> Memory allocation can become slower as the allocator struggles to find suitable contiguous blocks.
          </>
        ),
      });
    }
    
    // Cache Performance Analysis
    if (metrics.overallHitRatio < 0.5) {
      insights.push({
        type: "warning",
        icon: "⚠️",
        title: "Low Cache Hit Ratio",
        message: `Hit ratio of ${(metrics.overallHitRatio * 100).toFixed(1)}% indicates poor cache effectiveness. Consider reviewing cache strategy, TTL settings, and data access patterns.`
      });
    } else if (metrics.overallHitRatio < 0.7) {
      insights.push({
        type: "info",
        icon: "📈",
        title: "Cache Optimization Opportunity",
        message: `Hit ratio could be improved from ${(metrics.overallHitRatio * 100).toFixed(1)}%. Review frequently accessed keys and implement cache warming strategies.`
      });
    } else if (metrics.overallHitRatio > 0.95) {
      insights.push({
        type: "success",
        icon: "🎯",
        title: "Excellent Cache Performance",
        message: `Outstanding hit ratio of ${(metrics.overallHitRatio * 100).toFixed(1)}%! Your cache strategy is highly effective.`
      });
    }
    
    // Workload Analysis
    if (opsPerSec > 10000) {
      insights.push({
        type: "info",
        icon: "⚡",
        title: "High Traffic Load",
        message: `Processing ${opsPerSec.toLocaleString()} ops/sec. Monitor for potential bottlenecks and consider scaling if response times increase.`
      });
    } else if (opsPerSec < 100) {
      insights.push({
        type: "info",
        icon: "📊",
        title: "Low Traffic Volume",
        message: `Current load is ${opsPerSec} ops/sec. Consider traffic patterns and optimization opportunities during peak hours.`
      });
    }
    
    // Memory Management
    if (memUsagePercent > 90) {
      insights.push({
        type: "warning",
        icon: "💾",
        title: "High Memory Usage",
        message: `Memory usage at ${memUsagePercent.toFixed(1)}% of total capacity. Consider adding memory, implementing data eviction policies, or optimizing data structures.`
      });
    } else if (memUsagePercent > 75) {
      insights.push({
        type: "info",
        icon: "📊",
        title: "Moderate Memory Usage",
        message: `Memory usage at ${memUsagePercent.toFixed(1)}%. Monitor growth trends and plan for capacity if needed.`
      });
    }
    
    // Response Time Analysis
    if (metrics.avgResponseTime > 10) {
      insights.push({
        type: "warning",
        icon: "⏱️",
        title: "High Response Times",
        message: `Average response time of ${metrics.avgResponseTime.toFixed(1)}ms is elevated. Check for blocking operations, network latency, or resource contention.`
      });
    } else if (metrics.avgResponseTime < 1) {
      insights.push({
        type: "success",
        icon: "🚀",
        title: "Excellent Response Time",
        message: `Sub-millisecond response times indicate optimal performance and efficient operations.`
      });
    }
    
    // CPU Utilization Analysis
    const cpuSeconds = metrics.cpuUtilization || 0;
    if (cpuSeconds > 1000) {
      insights.push({
        type: "warning",
        icon: "🔥",
        title: "High CPU Usage",
        message: `CPU usage at ${cpuSeconds.toFixed(1)} seconds indicates heavy processing. Consider optimizing operations or scaling resources.`
      });
    }
    
    // Operations Balance
    const { reads, writes, deletes } = metrics.operations;
    const totalOpsByType = reads + writes + deletes;
    if (totalOpsByType > 0) {
      const readPercent = (reads / totalOpsByType) * 100;
      const writePercent = (writes / totalOpsByType) * 100;
      
      if (writePercent > 70) {
        insights.push({
          type: "info",
          icon: "✍️",
          title: "Write-Heavy Workload",
          message: `${writePercent.toFixed(1)}% write operations. Ensure adequate persistence configuration and monitor replication lag if applicable.`
        });
      } else if (readPercent > 90) {
        insights.push({
          type: "info",
          icon: "📖",
          title: "Read-Heavy Workload",
          message: `${readPercent.toFixed(1)}% read operations. Excellent for caching use cases. Consider read replicas for further scaling.`
        });
      }
    }
    
    // Uptime and Stability
    const uptimeDays = Math.floor((metrics.uptimeInSeconds || 0) / (24 * 60 * 60));
    if (uptimeDays > 30) {
      insights.push({
        type: "success",
        icon: "🛡️",
        title: "Excellent Stability",
        message: `${uptimeDays} days uptime demonstrates exceptional stability and reliability.`
      });
    }
    
    if (insights.length === 0) {
      insights.push({
        type: "success",
        icon: "✅",
        title: "Optimal Performance",
        message: "All metrics are within healthy ranges. Your Redis instance is performing excellently across all key indicators."
      });
    }
    
    return insights;
  };
  
  const insights = getPerformanceInsights();
  const HealthIcon = healthIcon;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-6">
        <Info className="h-6 w-6 text-blue-500 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Performance Assessment</h2>
      </div>
      
      <div className={`${healthBgColor} ${healthBorderColor} border-2 rounded-xl p-6 mb-6`}>
        <div className="flex items-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${healthColor} bg-white dark:bg-gray-800 border-2 border-current shadow-lg`}>
            <HealthIcon className="h-8 w-8" />
          </div>
          <div className="ml-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Health Score</div>
            <div className="flex items-center mb-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{healthScore}/100</span>
              <span className={`ml-4 text-xl font-semibold ${healthColor}`}>
                {healthStatus}
              </span>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">{statusDescription}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Hit Ratio</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{(metrics.overallHitRatio * 100).toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Ops/Sec</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{(metrics.instantaneousOpsPerSec || 0).toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">CPU Usage</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{(metrics.cpuUtilization || 0).toFixed(1)}s</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Response Time</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{metrics.avgResponseTime.toFixed(1)}ms</div>
          </div>
        </div>
      </div>
      
      {/* Performance Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Performance Insights & Recommendations
        </h3>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400' :
              insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-400'
            }`}>
              <div className="flex items-start">
                <span className="text-2xl mr-3 mt-1">{insight.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
