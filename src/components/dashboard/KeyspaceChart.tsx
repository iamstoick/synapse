
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
    { name: "Hits", value: hits, color: "#10B981", percentage: 0 },
    { name: "Misses", value: misses, color: "#EF4444", percentage: 0 }
  ];
  
  const total = hits + misses;
  
  // Calculate percentages
  if (total > 0) {
    data[0].percentage = (hits / total) * 100;
    data[1].percentage = (misses / total) * 100;
  }
  
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
        fontSize="14"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    ) : null;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Count: {data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Percentage: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[400px]">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Keyspace Performance</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Operations: {total.toLocaleString()}
        </div>
      </div>
      {total > 0 ? (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color, fontWeight: 'medium' }}>
                    {value}: {entry.payload.value.toLocaleString()}
                  </span>
                )}
              />
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No keyspace data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyspaceChart;
