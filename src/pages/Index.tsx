import { useState, useEffect } from "react";
import { RedisPerformanceMetrics, RedisConnection } from "@/types/redis";
import Header from "@/components/dashboard/Header";
import MemoryUsage from "@/components/dashboard/MemoryUsage";
import OperationsChart from "@/components/dashboard/OperationsChart";
import KeyspaceChart from "@/components/dashboard/KeyspaceChart";
import Navbar from "@/components/dashboard/Navbar";
import InfoPanel from "@/components/dashboard/InfoPanel";
import RedisConnectionForm from "@/components/dashboard/RedisConnectionForm";
import RealtimeIndicator from "@/components/dashboard/RealtimeIndicator";
import MetricsStream from "@/components/dashboard/MetricsStream";
import SlowCommands from "@/components/dashboard/SlowCommands";
import MemoryAnalysis from "@/components/dashboard/MemoryAnalysis";
import PersistenceAnalysis from "@/components/dashboard/PersistenceAnalysis";
import ClientsConnections from "@/components/dashboard/ClientsConnections";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";
import CpuUsage from "@/components/dashboard/CpuUsage";

const Index = () => {
  const [connection, setConnection] = useState<RedisConnection | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(false);

  const { latestMetrics, metricsHistory, isConnected: isRealtimeConnected } = useRealtimeMetrics({
    connectionId: connection?.id,
    enabled: isRealtimeEnabled && !!connection?.id
  });

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
    refetchInterval: isRealtimeEnabled ? false : 10000
  });

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
  
  useEffect(() => {
    if (connection?.connectionString && !isRealtimeEnabled) {
      handleRefresh();
    }
  }, [connection]);

  useEffect(() => {
    if (latestMetrics) {
      setLastUpdated(new Date());
    }
  }, [latestMetrics]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onRefresh={handleRefresh} lastUpdated={lastUpdated} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <RedisConnectionForm
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          isConnected={!!connection?.isConnected}
          connectionString={connection?.connectionString}
        />

        {connection && (
          <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <RealtimeIndicator 
                isConnected={isRealtimeConnected} 
                lastUpdate={lastUpdated}
              />
              <button
                onClick={toggleRealtime}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                  isRealtimeEnabled
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                }`}
              >
                {isRealtimeEnabled ? 'Disable Real-time' : 'Enable Real-time'}
              </button>
            </div>
          </div>
        )}
        
        {currentMetrics && (
          <div className="space-y-8">
            <Header metrics={currentMetrics} />
            
            {isRealtimeEnabled && metricsHistory.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <MetricsStream metricsHistory={metricsHistory} />
              </div>
            )}
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-8">
                <MemoryUsage metrics={currentMetrics} />
                <MemoryAnalysis metrics={currentMetrics} />
                <InfoPanel metrics={currentMetrics} />
              </div>
              <div className="space-y-8">
                <OperationsChart metrics={currentMetrics} />
                <KeyspaceChart metrics={currentMetrics} />
                <CpuUsage metrics={currentMetrics} />
                <SlowCommands metrics={currentMetrics} />
              </div>
            </div>

            {/* New sections in full width */}
            <div className="grid grid-cols-1 gap-8">
              <PersistenceAnalysis metrics={currentMetrics} />
              <ClientsConnections metrics={currentMetrics} />
            </div>
          </div>
        )}
        
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8 mt-12">
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
