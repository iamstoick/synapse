
import { RedisPerformanceMetrics } from "@/types/redis";
import { Info, Check, Clock, AlertCircle } from "lucide-react";

interface InfoPanelProps {
  metrics: RedisPerformanceMetrics;
}

const InfoPanel = ({ metrics }: InfoPanelProps) => {
  // Calculate health score based on hit ratio and response time
  const calculateHealthScore = (ratio: number, responseTime: number) => {
    // Simple weighted score (70% hit ratio, 30% response time)
    const hitRatioScore = ratio * 100; // 0-100
    const responseTimeScore = Math.max(0, 100 - (responseTime * 10)); // Penalize high response times
    
    return Math.round((hitRatioScore * 0.7) + (responseTimeScore * 0.3));
  };
  
  const healthScore = calculateHealthScore(metrics.overallHitRatio, metrics.avgResponseTime);
  
  // Determine health status
  let healthStatus = "Excellent";
  let healthColor = "text-green-500";
  let healthIcon = Check;
  
  if (healthScore < 50) {
    healthStatus = "Poor";
    healthColor = "text-red-500";
    healthIcon = AlertCircle;
  } else if (healthScore < 70) {
    healthStatus = "Average";
    healthColor = "text-yellow-500";
    healthIcon = Clock;
  } else if (healthScore < 85) {
    healthStatus = "Good";
    healthColor = "text-blue-500";
    healthIcon = Check;
  }
  
  // Cache performance tips based on hit ratio
  const getCacheTips = () => {
    if (metrics.overallHitRatio < 0.5) {
      return "Consider increasing cache size or reviewing cache strategy";
    } else if (metrics.overallHitRatio < 0.7) {
      return "Cache performance could be improved. Review TTL settings";
    } else if (metrics.overallHitRatio < 0.8) {
      return "Good cache performance. Monitor for specific key misses";
    } else {
      return "Excellent cache performance. Continue monitoring";
    }
  };
  
  const HealthIcon = healthIcon;
  
  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <div className="flex items-center mb-3">
        <Info className="h-5 w-5 text-blue-500 mr-2" />
        <h2 className="text-lg font-semibold">Cache Health Assessment</h2>
      </div>
      
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${healthColor} bg-opacity-10`}>
          <HealthIcon className="h-6 w-6" />
        </div>
        <div className="ml-3">
          <div className="text-sm text-gray-500">Health Score</div>
          <div className="flex items-center">
            <span className="text-xl font-bold">{healthScore}/100</span>
            <span className={`ml-2 text-sm font-medium ${healthColor}`}>
              {healthStatus}
            </span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-3">
        <h3 className="text-sm font-medium mb-2">Performance Insights</h3>
        <p className="text-sm text-gray-600">{getCacheTips()}</p>
      </div>
    </div>
  );
};

export default InfoPanel;
