
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
    { name: "Total", value: memoryUsage.total, fill: "#D1D5DB" }
  ];
  
  const formatMemory = (value: number) => {
    return `${value} MB`;
  };
  
  return (
    <div className="bg-card p-4 rounded-lg shadow-sm h-[300px]">
      <h2 className="text-lg font-semibold mb-4">Memory Usage</h2>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart 
          data={data} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" domain={[0, memoryUsage.total]} tickFormatter={formatMemory} />
          <YAxis type="category" dataKey="name" width={80} />
          <Tooltip formatter={(value) => [`${value} MB`, 'Memory']} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            <LabelList dataKey="value" position="right" formatter={formatMemory} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MemoryUsage;
