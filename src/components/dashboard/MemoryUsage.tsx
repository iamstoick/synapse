
import { RedisPerformanceMetrics } from "@/types/redis";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LabelList
} from "recharts";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface MemoryUsageProps {
  metrics: RedisPerformanceMetrics;
}

const MemoryUsage = ({ metrics }: MemoryUsageProps) => {
  const { memoryUsage } = metrics;
  
  // Format data for the chart
  const data = [
    { name: "Used", value: memoryUsage.used, fill: "#3B82F6" },
    { name: "Peak", value: memoryUsage.peak, fill: "#F59E0B" },
    { name: "Total", value: memoryUsage.total, fill: "#E5E7EB" }
  ];
  
  const formatMemory = (value: number) => {
    return `${value} MB`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{`${label}: ${payload[0].value} MB`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[500px]">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Memory Usage</h2>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Redis memory consumption showing used, peak, and total system memory</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <span>Used: {formatMemory(memoryUsage.used)}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current memory used by Redis</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <span>Peak: {formatMemory(memoryUsage.peak)}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Maximum memory used by Redis since startup</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <span>Total: {formatMemory(memoryUsage.total)}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total system memory available</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        
        {/* Memory Utilization Percentage */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Memory Utilization</span>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of total system memory used by Redis</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {memoryUsage.utilizationPercentage?.toFixed(2)}%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(memoryUsage.utilizationPercentage || 0, 100)}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical"
            margin={{ top: 20, right: 60, left: 60, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" opacity={0.3} />
            <XAxis 
              type="number" 
              domain={[0, memoryUsage.total]} 
              tickFormatter={formatMemory}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={80}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              <LabelList 
                dataKey="value" 
                position="right" 
                formatter={formatMemory}
                style={{ fontSize: '12px', fill: '#374151' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MemoryUsage;
