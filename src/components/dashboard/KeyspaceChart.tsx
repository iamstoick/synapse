
import { RedisPerformanceMetrics } from "@/types/redis";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

interface KeyspaceChartProps {
  metrics: RedisPerformanceMetrics;
}

const KeyspaceChart = ({ metrics }: KeyspaceChartProps) => {
  const hits = metrics.keyspaceHits || 0;
  const misses = metrics.keyspaceMisses || 0;
  
  // Format data for the chart
  const data = [
    { name: "Hits", value: hits, color: "#10B981" },
    { name: "Misses", value: misses, color: "#EF4444" }
  ];
  
  const total = hits + misses;
  
  const COLORS = ["#10B981", "#EF4444"];
  
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
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };
  
  return (
    <div className="bg-card p-4 rounded-lg shadow-sm h-[300px]">
      <h2 className="text-lg font-semibold mb-2">Keyspace Hits vs Misses</h2>
      <div className="text-sm text-gray-500 mb-2">
        Total: {total.toLocaleString()} operations
      </div>
      {total > 0 ? (
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
            <Tooltip formatter={(value) => [value.toLocaleString(), 'Count']} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          No keyspace data available
        </div>
      )}
    </div>
  );
};

export default KeyspaceChart;
