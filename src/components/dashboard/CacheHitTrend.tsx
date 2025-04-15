
import { TimeSeriesData } from "@/types/redis";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

interface CacheHitTrendProps {
  data: TimeSeriesData[];
  level: 1 | 2 | 3 | 4;
  className?: string;
}

const CacheHitTrend = ({ data, level, className }: CacheHitTrendProps) => {
  if (data.length < 2) return null;
  
  // Get the most recent data points
  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2];
  
  // Determine the field name based on the level
  const fieldName = `level${level}` as keyof TimeSeriesData;
  
  // Calculate the percentage change
  const current = latestData[fieldName] as number;
  const previous = previousData[fieldName] as number;
  
  const percentageChange = ((current - previous) / previous) * 100;
  const isPositive = percentageChange >= 0;
  
  return (
    <div className={cn("flex items-center p-3 rounded-lg", className)}>
      <div className={cn(
        "rounded-full w-8 h-8 flex items-center justify-center mr-2",
        isPositive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
      )}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
      </div>
      
      <div>
        <div className="flex items-center">
          <span className="text-sm font-medium">L{level} Cache</span>
          <ArrowRight className="w-3 h-3 mx-1 text-gray-400" />
          <span className={cn(
            "text-sm font-semibold",
            isPositive ? "text-green-600" : "text-red-600"
          )}>
            {isPositive ? "+" : ""}{percentageChange.toFixed(1)}%
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {(current * 100).toFixed(1)}% hit ratio
        </div>
      </div>
    </div>
  );
};

export default CacheHitTrend;
