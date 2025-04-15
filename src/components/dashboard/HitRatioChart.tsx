
import { TimeSeriesData } from "@/types/redis";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface HitRatioChartProps {
  data: TimeSeriesData[];
}

const HitRatioChart = ({ data }: HitRatioChartProps) => {
  return (
    <div className="bg-card p-4 rounded-lg shadow-sm h-[400px]">
      <h2 className="text-lg font-semibold mb-4">Cache Hit Ratio Over Time</h2>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis 
            domain={[0, 1]} 
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} 
            tick={{ fontSize: 12 }} 
          />
          <Tooltip 
            formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Hit Ratio']} 
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="level1" 
            name="L1 Cache" 
            stroke="#3B82F6" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="level2" 
            name="L2 Cache" 
            stroke="#6366F1" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="level3" 
            name="L3 Cache" 
            stroke="#8B5CF6" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="level4" 
            name="L4 Cache" 
            stroke="#A855F7" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="overall" 
            name="Overall" 
            stroke="#10B981" 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HitRatioChart;
