
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

interface OperationsChartProps {
  metrics: RedisPerformanceMetrics;
}

const OperationsChart = ({ metrics }: OperationsChartProps) => {
  const { operations } = metrics;
  
  // Format data for the chart
  const data = [
    { name: "Reads", value: operations.reads, fill: "#3B82F6" },
    { name: "Writes", value: operations.writes, fill: "#10B981" },
    { name: "Deletes", value: operations.deletes, fill: "#F59E0B" }
  ];
  
  const total = operations.reads + operations.writes + operations.deletes;
  
  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{`${label}: ${data.value.toLocaleString()}`}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Percentage: {total > 0 ? ((data.value / total) * 100).toFixed(1) : 0}%
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[400px]">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Operations Distribution</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Operations: {total.toLocaleString()}
        </div>
      </div>
      {total > 0 ? (
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
                tickFormatter={formatNumber}
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
                  formatter={formatNumber}
                  style={{ fontSize: '12px', fill: '#374151' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No operations data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsChart;
