import { useState, useEffect } from "react";
import { RedisPerformanceMetrics, RedisConnection } from "@/types/redis";
import Header from "@/components/dashboard/Header";
import MemoryUsage from "@/components/dashboard/MemoryUsage";
import OperationsChart from "@/components/dashboard/OperationsChart";
import KeyspaceChart from "@/components/dashboard/KeyspaceChart";
import Navbar from "@/components/dashboard/Navbar";
import InfoPanel from "@/components/dashboard/InfoPanel";
import RedisConnectionForm from "@/components/dashboard/RedisConnectionForm";
import RedisConnectionsList from "@/components/dashboard/RedisConnectionsList";
import SlowCommands from "@/components/dashboard/SlowCommands";
import MemoryAnalysis from "@/components/dashboard/MemoryAnalysis";
import PersistenceAnalysis from "@/components/dashboard/PersistenceAnalysis";
import ClientsConnections from "@/components/dashboard/ClientsConnections";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

import CpuUsage from "@/components/dashboard/CpuUsage";

const Index = () => {
  const [connection, setConnection] = useState<RedisConnection | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());


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
    enabled: !!connection?.connectionString,
    refetchInterval: 10000
  });

  const currentMetrics = metrics;
  
  const handleConnect = async (newConnection: RedisConnection) => {
    setConnection(newConnection);
    toast.success('Successfully connected to Redis server');
  };
  
  const handleDisconnect = () => {
    setConnection(null);
    toast.info('Disconnected from Redis server');
  };
  
  const handleRefresh = () => {
    refetch();
    setLastUpdated(new Date());
    toast.info('Refreshing metrics...');
  };
  
  useEffect(() => {
    if (connection?.connectionString) {
      handleRefresh();
    }
  }, [connection]);

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

        <RedisConnectionsList
          onConnect={handleConnect}
          currentConnectionId={connection?.id}
        />

        
        {currentMetrics && (
          <div className="space-y-8">
            <Header metrics={currentMetrics} />
            
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-8">
                <MemoryUsage metrics={currentMetrics} />
                <MemoryAnalysis metrics={currentMetrics} />
                <InfoPanel metrics={currentMetrics} connectionId={connection?.id} />
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
              ? 'Connected to Redis (Polling every 10 seconds)' 
              : 'Connect to a Redis server to see metrics'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
