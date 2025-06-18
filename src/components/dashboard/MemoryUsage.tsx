
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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[400px]">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Memory Usage</h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Used: {formatMemory(memoryUsage.used)}</span>
          <span>Peak: {formatMemory(memoryUsage.peak)}</span>
          <span>Total: {formatMemory(memoryUsage.total)}</span>
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
