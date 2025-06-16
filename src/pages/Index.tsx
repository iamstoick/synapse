
import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true);

  // Real-time metrics hook - enabled when we have a connection
  const { latestMetrics, metricsHistory, isConnected: isRealtimeConnected } = useRealtimeMetrics({
    connectionId: connection?.id,
    enabled: isRealtimeEnabled && !!connection?.id
  });

  // Fetch metrics using React Query - only when real-time is disabled
  const { data: polledMetrics = null, refetch } = useQuery({
    queryKey: ['redis-metrics', connection?.connectionString],
    queryFn: async () => {
      if (!connection?.connectionString) return null;

      try {
        console.log('Fetching metrics via polling...');
        const { data, error } = await supabase.functions.invoke('redis-monitor', {
          body: { connectionString: connection.connectionString }
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error || 'Failed to fetch metrics');

        console.log('Polled metrics received:', data.metrics);

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
    refetchInterval: !isRealtimeEnabled ? 10000 : false
  });

  // Memoize current metrics to ensure proper updates
  const currentMetrics = useMemo(() => {
    if (isRealtimeEnabled && latestMetrics) {
      console.log('Using real-time metrics:', latestMetrics);
      return latestMetrics;
    }
    if (!isRealtimeEnabled && polledMetrics) {
      console.log('Using polled metrics:', polledMetrics);
      return polledMetrics;
    }
    return null;
  }, [isRealtimeEnabled, latestMetrics, polledMetrics]);
  
  const handleConnect = async (newConnection: RedisConnection) => {
    setConnection(newConnection);
    setIsRealtimeEnabled(true);
    toast.success('Successfully connected to Redis server');
  };
  
  const handleDisconnect = () => {
    setConnection(null);
    setIsRealtimeEnabled(false);
    setTimeSeriesData([]);
    toast.info('Disconnected from Redis server');
  };
  
  const handleRefresh = useCallback(() => {
    if (!isRealtimeEnabled) {
      refetch();
    } else {
      // For real-time mode, trigger a manual metrics fetch to get immediate data
      if (connection?.connectionString) {
        supabase.functions.invoke('redis-monitor', {
          body: { connectionString: connection.connectionString }
        }).then(({ data, error }) => {
          if (!error && data?.success && connection.id) {
            supabase.from('redis_metrics').insert({
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
          }
        });
      }
    }
    setLastUpdated(new Date());
    toast.info('Refreshing metrics...');
  }, [isRealtimeEnabled, connection, refetch]);

  const toggleRealtime = useCallback(() => {
    const newRealtimeState = !isRealtimeEnabled;
    setIsRealtimeEnabled(newRealtimeState);
    
    if (newRealtimeState) {
      toast.success('Real-time streaming enabled');
    } else {
      toast.info('Real-time streaming disabled - switching to polling mode');
      // Immediately fetch data when switching to polling mode
      setTimeout(() => refetch(), 100);
    }
  }, [isRealtimeEnabled, refetch]);
  
  // Update last updated time when real-time metrics change
  useEffect(() => {
    if (latestMetrics && isRealtimeEnabled) {
      setLastUpdated(new Date());
      console.log('Real-time metrics updated, timestamp:', latestMetrics.timestamp);
    }
  }, [latestMetrics, isRealtimeEnabled]);
  
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
              isConnected={isRealtimeEnabled && isRealtimeConnected} 
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
            <Header key={currentMetrics.timestamp} metrics={currentMetrics} />
            
            {isRealtimeEnabled && metricsHistory.length > 0 && (
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
              <MemoryUsage key={`memory-${currentMetrics.timestamp}`} metrics={currentMetrics} />
              <OperationsChart key={`ops-${currentMetrics.timestamp}`} metrics={currentMetrics} />
            </div>
            
            <div className="mb-6">
              <InfoPanel key={`info-${currentMetrics.timestamp}`} metrics={currentMetrics} />
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
