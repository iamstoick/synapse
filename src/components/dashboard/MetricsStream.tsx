
import { useEffect, useState } from 'react';
import { RedisPerformanceMetrics } from '@/types/redis';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricsStreamProps {
  metricsHistory: RedisPerformanceMetrics[];
}

const MetricsStream = ({ metricsHistory }: MetricsStreamProps) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const transformedData = metricsHistory.slice(-20).map((metrics, index) => ({
      time: new Date(metrics.timestamp).toLocaleTimeString(),
      hitRatio: (metrics.overallHitRatio * 100).toFixed(1),
      cpuUsage: metrics.cpuUtilization || 0,
      memoryUsed: metrics.memoryUsage.used,
      totalRequests: metrics.totalRequests
    }));

    setChartData(transformedData);
  }, [metricsHistory]);

  if (chartData.length === 0) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Real-time Metrics Stream</h3>
        <div className="text-center text-gray-500 py-8">
          Waiting for real-time data...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Real-time Metrics Stream</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="hitRatio" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="Hit Ratio (%)"
            />
            <Line 
              type="monotone" 
              dataKey="cpuUsage" 
              stroke="#82ca9d" 
              strokeWidth={2}
              name="CPU Usage (%)"
            />
            <Line 
              type="monotone" 
              dataKey="memoryUsed" 
              stroke="#ffc658" 
              strokeWidth={2}
              name="Memory Used (MB)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricsStream;
