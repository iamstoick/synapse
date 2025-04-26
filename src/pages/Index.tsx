
import { useState, useEffect } from "react";
import { RedisPerformanceMetrics, TimeSeriesData, RedisConnection } from "@/types/redis";
import Header from "@/components/dashboard/Header";
import HitRatioGauge from "@/components/dashboard/HitRatioGauge";
import HitRatioChart from "@/components/dashboard/HitRatioChart";
import MemoryUsage from "@/components/dashboard/MemoryUsage";
import OperationsChart from "@/components/dashboard/OperationsChart";
import Navbar from "@/components/dashboard/Navbar";
import CacheHitTrend from "@/components/dashboard/CacheHitTrend";
import InfoPanel from "@/components/dashboard/InfoPanel";
import RedisConnectionForm from "@/components/dashboard/RedisConnectionForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const [connection, setConnection] = useState<RedisConnection | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch metrics using React Query
  const { data: metrics = null, refetch } = useQuery({
    queryKey: ['redis-metrics', connection?.connectionString],
    queryFn: async () => {
      if (!connection?.connectionString) return null;

      const { data, error } = await supabase.functions.invoke('redis-monitor', {
        body: { connectionString: connection.connectionString }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to fetch metrics');

      // Save metrics to the database
      await supabase.from('redis_metrics').insert({
        connection_id: connection.id,
        ...data.metrics
      });

      return data.metrics;
    },
    enabled: !!connection?.connectionString,
    refetchInterval: 10000 // Refresh every 10 seconds when component is visible
  });
  
  const handleConnect = async (newConnection: RedisConnection) => {
    setConnection(newConnection);
  };
  
  const handleDisconnect = () => {
    setConnection(null);
  };
  
  const handleRefresh = () => {
    refetch();
    setLastUpdated(new Date());
  };
  
  // Initial data load and refresh setup
  useEffect(() => {
    if (connection?.connectionString) {
      handleRefresh();
    }
  }, [connection]);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar onRefresh={handleRefresh} lastUpdated={lastUpdated} />
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <RedisConnectionForm
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          isConnected={!!connection?.isConnected}
          connectionString={connection?.connectionString}
        />
        
        {metrics && (
          <>
            <Header metrics={metrics} />
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Cache Hit Ratio by Level</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-card p-6 rounded-lg shadow-sm">
                {metrics.cacheLevels.map((level) => (
                  <div key={level.level} className="text-center">
                    <HitRatioGauge cacheLevel={level} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <HitRatioChart data={timeSeriesData} />
            </div>
            
            <div className="mb-6 bg-card p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-3">Cache Hit Trends</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <CacheHitTrend data={timeSeriesData} level={1} className="bg-blue-50" />
                <CacheHitTrend data={timeSeriesData} level={2} className="bg-indigo-50" />
                <CacheHitTrend data={timeSeriesData} level={3} className="bg-purple-50" />
                <CacheHitTrend data={timeSeriesData} level={4} className="bg-violet-50" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <MemoryUsage metrics={metrics} />
              <OperationsChart metrics={metrics} />
            </div>
            
            <div className="mb-6">
              <InfoPanel metrics={metrics} />
            </div>
          </>
        )}
        
        <div className="text-center text-sm text-gray-500 py-4">
          <p>{connection?.isConnected ? 'Connected to Redis' : 'Connect to a Redis server to see metrics'}</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
