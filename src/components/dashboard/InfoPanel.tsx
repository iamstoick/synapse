
import { RedisPerformanceMetrics } from "@/types/redis";
import { Info, Check, Clock, AlertCircle, TrendingUp, TrendingDown, Activity } from "lucide-react";

interface InfoPanelProps {
  metrics: RedisPerformanceMetrics;
}

const InfoPanel = ({ metrics }: InfoPanelProps) => {
  // Enhanced health score calculation
  const calculateHealthScore = (ratio: number, responseTime: number, cpuUsage: number, opsPerSec: number) => {
    // Hit ratio score (40% weight)
    const hitRatioScore = ratio * 100;
    
    // Response time score (25% weight) - penalize high response times more severely
    const responseTimeScore = Math.max(0, 100 - Math.pow(responseTime, 1.5));
    
    // CPU usage score (25% weight) - optimal range is 20-70%
    let cpuScore = 100;
    if (cpuUsage > 80) {
      cpuScore = Math.max(0, 100 - (cpuUsage - 80) * 3);
    } else if (cpuUsage < 10) {
      cpuScore = 80; // Low CPU might indicate underutilization
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
  let healthIcon = Check;
  let statusDescription = "";
  
  if (healthScore < 30) {
    healthStatus = "Critical";
    healthColor = "text-red-600";
    healthIcon = AlertCircle;
    statusDescription = "Immediate attention required";
  } else if (healthScore < 50) {
    healthStatus = "Poor";
    healthColor = "text-red-500";
    healthIcon = TrendingDown;
    statusDescription = "Performance issues detected";
  } else if (healthScore < 65) {
    healthStatus = "Below Average";
    healthColor = "text-orange-500";
    healthIcon = Clock;
    statusDescription = "Room for improvement";
  } else if (healthScore < 80) {
    healthStatus = "Good";
    healthColor = "text-blue-500";
    healthIcon = TrendingUp;
    statusDescription = "Performing well";
  } else if (healthScore < 90) {
    healthStatus = "Very Good";
    healthColor = "text-green-400";
    healthIcon = Check;
    statusDescription = "Strong performance";
  } else {
    healthStatus = "Excellent";
    healthColor = "text-green-600";
    healthIcon = Check;
    statusDescription = "Optimal performance";
  }
  
  // Enhanced performance insights
  const getPerformanceInsights = () => {
    const insights = [];
    
    // Hit ratio analysis
    if (metrics.overallHitRatio < 0.5) {
      insights.push("⚠️ Low hit ratio indicates poor cache effectiveness. Consider reviewing cache strategy and TTL settings.");
    } else if (metrics.overallHitRatio < 0.7) {
      insights.push("📈 Hit ratio could be improved. Review frequently accessed keys and cache warming strategies.");
    } else if (metrics.overallHitRatio > 0.95) {
      insights.push("🎯 Excellent hit ratio! Cache is highly effective.");
    }
    
    // CPU usage analysis
    const cpuUsage = metrics.cpuUtilization || 0;
    if (cpuUsage > 80) {
      insights.push("🔥 High CPU usage detected. Consider scaling or optimizing operations.");
    } else if (cpuUsage < 10) {
      insights.push("💤 Low CPU usage might indicate underutilization or low traffic.");
    }
    
    // Operations analysis
    const opsPerSec = metrics.instantaneousOpsPerSec || 0;
    if (opsPerSec > 10000) {
      insights.push("⚡ High throughput detected. Monitor for potential bottlenecks.");
    } else if (opsPerSec < 100) {
      insights.push("📊 Low operation rate. Consider traffic patterns and optimization opportunities.");
    }
    
    // Memory analysis
    const memUsage = metrics.memoryUsage.used / metrics.memoryUsage.total;
    if (memUsage > 0.9) {
      insights.push("💾 Memory usage is high. Consider adding more memory or optimizing data structures.");
    }
    
    // Response time analysis
    if (metrics.avgResponseTime > 10) {
      insights.push("⏱️ High response times detected. Check for blocking operations or network issues.");
    }
    
    if (insights.length === 0) {
      insights.push("✅ All metrics are within healthy ranges. Continue monitoring for optimal performance.");
    }
    
    return insights;
  };
  
  const insights = getPerformanceInsights();
  const HealthIcon = healthIcon;
  
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <Info className="h-5 w-5 text-blue-500 mr-2" />
        <h2 className="text-lg font-semibold">Cache Health Assessment</h2>
      </div>
      
      <div className="flex items-center mb-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${healthColor} bg-opacity-10 border-2 border-current`}>
          <HealthIcon className="h-8 w-8" />
        </div>
        <div className="ml-4">
          <div className="text-sm text-gray-500 mb-1">Health Score</div>
          <div className="flex items-center mb-1">
            <span className="text-2xl font-bold">{healthScore}/100</span>
            <span className={`ml-3 text-lg font-medium ${healthColor}`}>
              {healthStatus}
            </span>
          </div>
          <div className="text-sm text-gray-600">{statusDescription}</div>
        </div>
      </div>

      {/* Performance Metrics Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Hit Ratio</div>
          <div className="text-lg font-semibold">{(metrics.overallHitRatio * 100).toFixed(1)}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Ops/Sec</div>
          <div className="text-lg font-semibold">{(metrics.instantaneousOpsPerSec || 0).toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wide">CPU Usage</div>
          <div className="text-lg font-semibold">{(metrics.cpuUtilization || 0).toFixed(1)}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Response Time</div>
          <div className="text-lg font-semibold">{metrics.avgResponseTime.toFixed(1)}ms</div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          Performance Insights
        </h3>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <p key={index} className="text-sm text-gray-600 leading-relaxed">
              {insight}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
