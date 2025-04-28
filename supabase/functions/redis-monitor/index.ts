import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { connect } from "https://deno.land/x/redis@v0.29.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function parseRedisInfo(info: string) {
  const metrics = {
    hitRatio: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cpuUtilization: 0,
    memoryUsed: 0,
    memoryPeak: 0,
    memoryTotal: 0,
    totalCommands: 0,
    dbSize: 0,
    keyspaceHits: 0,
    keyspaceMisses: 0,
    usedCpuSys: 0,
    usedMemoryHuman: '',
    usedMemoryPeakHuman: '',
    memFragmentationRatio: 0,
    uptimeInDays: 0,
    operations: {
      reads: 0,
      writes: 0,
      deletes: 0,
    },
    cacheLevels: [],
    timestamp: Date.now(),
    overallHitRatio: 0,
    totalRequests: 0,
    avgResponseTime: 0,
    memoryUsage: {
      used: 0,
      peak: 0,
      total: 0
    }
  };

  const sections = info.split('\n\n');
  sections.forEach(section => {
    const lines = section.split('\n');
    lines.forEach(line => {
      if (line.startsWith('#')) return;
      
      const [key, value] = line.split(':');
      if (!key || !value) return;

      switch (key.trim()) {
        case 'used_memory':
          metrics.memoryUsed = parseInt(value) || 0;
          metrics.memoryUsage.used = Math.round((parseInt(value) || 0) / (1024 * 1024));
          break;
        case 'used_memory_peak':
          metrics.memoryPeak = parseInt(value) || 0;
          metrics.memoryUsage.peak = Math.round((parseInt(value) || 0) / (1024 * 1024));
          break;
        case 'total_system_memory':
          metrics.memoryTotal = parseInt(value) || 0;
          metrics.memoryUsage.total = Math.round((parseInt(value) || 0) / (1024 * 1024));
          break;
        case 'total_commands_processed':
          metrics.totalCommands = parseInt(value) || 0;
          metrics.totalRequests = parseInt(value) || 0;
          break;
        case 'keyspace_hits':
          metrics.keyspaceHits = parseInt(value) || 0;
          metrics.cacheHits = parseInt(value) || 0;
          break;
        case 'keyspace_misses':
          metrics.keyspaceMisses = parseInt(value) || 0;
          metrics.cacheMisses = parseInt(value) || 0;
          break;
        case 'used_cpu_sys':
          metrics.usedCpuSys = parseFloat(value) || 0;
          metrics.cpuUtilization = parseFloat(value) || 0;
          break;
        case 'used_memory_human':
          metrics.usedMemoryHuman = value.trim();
          break;
        case 'used_memory_peak_human':
          metrics.usedMemoryPeakHuman = value.trim();
          break;
        case 'mem_fragmentation_ratio':
          metrics.memFragmentationRatio = parseFloat(value) || 0;
          break;
        case 'uptime_in_days':
          metrics.uptimeInDays = parseInt(value) || 0;
          break;
      }
    });
  });

  // Calculate hit ratio
  const totalAccesses = metrics.cacheHits + metrics.cacheMisses;
  metrics.hitRatio = totalAccesses > 0 ? metrics.cacheHits / totalAccesses : 0;
  metrics.overallHitRatio = metrics.hitRatio;

  // Set a reasonable default for avgResponseTime if we don't have it
  metrics.avgResponseTime = metrics.avgResponseTime || 5.0;

  return metrics;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { connectionString } = await req.json();

    if (!connectionString) {
      throw new Error("Connection string is required");
    }

    const parts = connectionString.split(' ');
    const host = parts[parts.indexOf('-h') + 1] || 'localhost';
    const port = parseInt(parts[parts.indexOf('-p') + 1]) || 6379;
    const password = parts[parts.indexOf('-a') + 1] || undefined;

    console.log(`Attempting to connect to Redis at ${host}:${port}`);

    const redis = await Promise.race([
      connect({
        hostname: host,
        port: port,
        password: password,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);

    // Get Redis INFO
    const info = await redis.info();
    
    // Get DBSIZE
    const dbSize = await redis.dbsize();
    
    // Parse metrics from INFO command
    const metrics = parseRedisInfo(info);
    metrics.dbSize = dbSize;
    
    // Close Redis connection
    await redis.close();

    return new Response(JSON.stringify({ 
      success: true,
      metrics: metrics 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Redis connection error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
