
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
import RealtimeIndicator from "@/components/dashboard/RealtimeIndicator";
import MetricsStream from "@/components/dashboard/MetricsStream";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";

const Index = () => {
  const [connection, setConnection] = useState<RedisConnection | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(false);

  // Real-time metrics hook
  const { latestMetrics, metricsHistory, isConnected: isRealtimeConnected } = useRealtimeMetrics({
    connectionId: connection?.id,
    enabled: isRealtimeEnabled && !!connection?.id
  });

  // Fetch metrics using React Query
  const { data: metrics = null, refetch } = useQuery({
    queryKey: ['redis-metrics', connection?.connectionString],
    queryFn: async () => {
      if (!connection?.connectionString) return null;

      try {
        const { data, error } = await supabase.functions.invoke('redis-monitor', {
          body: { connectionString: connection.connectionString }
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error || 'Failed to fetch metrics');

        // Save metrics to the database if we have a connection ID
        if (connection.id) {
          try {
            await supabase.from('redis_metrics').insert({
              connection_id: connection.id,
              cache_hits: data.metrics.keyspaceHits,
              cache_misses: data.metrics.keyspaceMisses,
              cpu_utilization: data.metrics.usedCpuSys,
              memory_used_bytes: data.metrics.memoryUsage.used * 1024 * 1024,
              memory_peak_bytes: data.metrics.memoryUsage.peak * 1024 * 1024,
              memory_total_bytes: data.metrics.memoryUsage.total * 1024 * 1024,
              total_commands_processed: data.metrics.totalRequests,
              avg_response_time: data.metrics.avgResponseTime,
              operations: data.metrics.operations,
              cache_levels: data.metrics.cacheLevels
            });
          } catch (dbError) {
            console.error('Error saving metrics to database:', dbError);
            // Don't throw here as we still want to show metrics even if saving fails
          }
        }

        return data.metrics;
      } catch (error) {
        console.error('Error fetching metrics:', error);
        toast.error('Failed to fetch Redis metrics');
        return null;
      }
    },
    enabled: !!connection?.connectionString && !isRealtimeEnabled,
    refetchInterval: isRealtimeEnabled ? false : 10000 // Only poll when realtime is disabled
  });

  // Use real-time metrics if available, otherwise use polled metrics
  const currentMetrics = latestMetrics || metrics;
  
  const handleConnect = async (newConnection: RedisConnection) => {
    setConnection(newConnection);
    toast.success('Successfully connected to Redis server');
  };
  
  const handleDisconnect = () => {
    setConnection(null);
    setIsRealtimeEnabled(false);
    toast.info('Disconnected from Redis server');
  };
  
  const handleRefresh = () => {
    if (!isRealtimeEnabled) {
      refetch();
    }
    setLastUpdated(new Date());
    toast.info('Refreshing metrics...');
  };

  const toggleRealtime = () => {
    setIsRealtimeEnabled(!isRealtimeEnabled);
    if (!isRealtimeEnabled) {
      toast.success('Real-time streaming enabled');
    } else {
      toast.info('Real-time streaming disabled');
    }
  };
  
  // Initial data load and refresh setup
  useEffect(() => {
    if (connection?.connectionString && !isRealtimeEnabled) {
      handleRefresh();
    }
  }, [connection]);

  // Update last updated time when real-time metrics change
  useEffect(() => {
    if (latestMetrics) {
      setLastUpdated(new Date());
    }
  }, [latestMetrics]);
  
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

        {connection && (
          <div className="mb-6 flex items-center justify-between bg-card p-4 rounded-lg shadow-sm">
            <RealtimeIndicator 
              isConnected={isRealtimeConnected} 
              lastUpdate={lastUpdated}
            />
            <button
              onClick={toggleRealtime}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isRealtimeEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isRealtimeEnabled ? 'Disable Real-time' : 'Enable Real-time'}
            </button>
          </div>
        )}
        
        {currentMetrics && (
          <>
            <Header metrics={currentMetrics} />
            
            {isRealtimeEnabled && (
              <div className="mb-6">
                <MetricsStream metricsHistory={metricsHistory} />
              </div>
            )}
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Cache Hit Ratio by Level</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-card p-6 rounded-lg shadow-sm">
                {currentMetrics.cacheLevels && currentMetrics.cacheLevels.map((level) => (
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
              <MemoryUsage metrics={currentMetrics} />
              <OperationsChart metrics={currentMetrics} />
            </div>
            
            <div className="mb-6">
              <InfoPanel metrics={currentMetrics} />
            </div>
          </>
        )}
        
        <div className="text-center text-sm text-gray-500 py-4">
          <p>
            {connection?.isConnected 
              ? `Connected to Redis ${isRealtimeEnabled ? '(Real-time streaming active)' : '(Polling mode)'}` 
              : 'Connect to a Redis server to see metrics'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
