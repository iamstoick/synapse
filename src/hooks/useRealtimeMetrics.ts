
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RedisPerformanceMetrics } from '@/types/redis';
import { toast } from 'sonner';

interface UseRealtimeMetricsProps {
  connectionId?: string;
  enabled: boolean;
}

export const useRealtimeMetrics = ({ connectionId, enabled }: UseRealtimeMetricsProps) => {
  const [latestMetrics, setLatestMetrics] = useState<RedisPerformanceMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<RedisPerformanceMetrics[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !connectionId) {
      setIsConnected(false);
      return;
    }

    console.log('Setting up real-time subscription for connection:', connectionId);

    const channel = supabase
      .channel(`redis-metrics-${connectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'redis_metrics',
          filter: `connection_id=eq.${connectionId}`
        },
        (payload) => {
          console.log('Received real-time metrics update:', payload);
          
          const newMetrics = payload.new as any;
          
          // Transform database record to RedisPerformanceMetrics format
          const transformedMetrics: RedisPerformanceMetrics = {
            timestamp: new Date(newMetrics.timestamp).getTime(),
            cacheLevels: newMetrics.cache_levels || [],
            overallHitRatio: newMetrics.hit_ratio || 0,
            totalRequests: newMetrics.total_commands_processed || 0,
            avgResponseTime: newMetrics.avg_response_time || 0,
            memoryUsage: {
              used: Math.round((newMetrics.memory_used_bytes || 0) / (1024 * 1024)),
              peak: Math.round((newMetrics.memory_peak_bytes || 0) / (1024 * 1024)),
              total: Math.round((newMetrics.memory_total_bytes || 0) / (1024 * 1024))
            },
            operations: newMetrics.operations || { reads: 0, writes: 0, deletes: 0 },
            cpuUtilization: newMetrics.cpu_utilization,
            dbSize: (newMetrics.cache_hits || 0) + (newMetrics.cache_misses || 0),
            keyspaceHits: newMetrics.cache_hits || 0,
            keyspaceMisses: newMetrics.cache_misses || 0,
            usedCpuSys: newMetrics.cpu_utilization,
            usedMemoryHuman: `${Math.round((newMetrics.memory_used_bytes || 0) / (1024 * 1024))}M`,
            usedMemoryPeakHuman: `${Math.round((newMetrics.memory_peak_bytes || 0) / (1024 * 1024))}M`,
            memFragmentationRatio: 1.0,
            uptimeInDays: Math.floor(Date.now() / (1000 * 60 * 60 * 24))
          };

          console.log('Transformed metrics:', transformedMetrics);

          setLatestMetrics(transformedMetrics);
          setMetricsHistory(prev => [...prev.slice(-99), transformedMetrics]);
          setIsConnected(true);
          
          toast.success('Live metrics updated', {
            description: `Hit ratio: ${(transformedMetrics.overallHitRatio * 100).toFixed(1)}%`
          });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('Successfully subscribed to real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          console.error('Real-time subscription error');
        }
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      setIsConnected(false);
      supabase.removeChannel(channel);
    };
  }, [connectionId, enabled]);

  return {
    latestMetrics,
    metricsHistory,
    isConnected
  };
};
