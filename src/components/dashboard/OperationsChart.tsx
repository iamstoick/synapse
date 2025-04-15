
import { RedisPerformanceMetrics } from "@/types/redis";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

interface OperationsChartProps {
  metrics: RedisPerformanceMetrics;
}

const OperationsChart = ({ metrics }: OperationsChartProps) => {
  const { operations } = metrics;
  
  // Format data for the chart
  const data = [
    { name: "Reads", value: operations.reads, color: "#3B82F6" },
    { name: "Writes", value: operations.writes, color: "#10B981" },
    { name: "Deletes", value: operations.deletes, color: "#F59E0B" }
  ];
  
  const total = operations.reads + operations.writes + operations.deletes;
  
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B"];
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ 
    cx, 
    cy, 
    midAngle, 
    innerRadius, 
    outerRadius, 
    percent 
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };
  
  return (
    <div className="bg-card p-4 rounded-lg shadow-sm h-[300px]">
      <h2 className="text-lg font-semibold mb-2">Operations Distribution</h2>
      <div className="text-sm text-gray-500 mb-2">
        Total: {total.toLocaleString()} ops
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip formatter={(value) => [value.toLocaleString(), 'Operations']} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OperationsChart;
