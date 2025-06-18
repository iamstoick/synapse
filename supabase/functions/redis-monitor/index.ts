
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
    uptimeInSeconds: 0,
    instantaneousOpsPerSec: 0,
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
    },
    // New metrics for additional sections
    memoryAnalysis: {
      fragmentationRatio: 0,
      evictedKeys: 0,
      expiredKeys: 0
    },
    persistence: {
      rdbLastSaveTime: 0,
      rdbChangesSinceLastSave: 0,
      aofCurrentSize: 0,
      aofBaseSize: 0,
      lastForkUsec: 0
    },
    clients: {
      connectedClients: 0,
      totalConnectionsReceived: 0,
      totalConnectionsReceived: 0,
      rejectedConnections: 0,
      maxClients: 0
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
        case 'uptime_in_seconds':
          metrics.uptimeInSeconds = parseInt(value) || 0;
          metrics.uptimeInDays = (parseInt(value) || 0) / (24 * 60 * 60);
          break;
        case 'instantaneous_ops_per_sec':
          metrics.instantaneousOpsPerSec = parseInt(value) || 0;
          break;
        case 'used_memory_human':
          metrics.usedMemoryHuman = value.trim();
          break;
        case 'used_memory_peak_human':
          metrics.usedMemoryPeakHuman = value.trim();
          break;
        case 'mem_fragmentation_ratio':
          metrics.memFragmentationRatio = parseFloat(value) || 0;
          metrics.memoryAnalysis.fragmentationRatio = parseFloat(value) || 0;
          break;
        
        // Memory Analysis metrics
        case 'evicted_keys':
          metrics.memoryAnalysis.evictedKeys = parseInt(value) || 0;
          break;
        case 'expired_keys':
          metrics.memoryAnalysis.expiredKeys = parseInt(value) || 0;
          break;
        
        // Persistence metrics
        case 'rdb_last_save_time':
          metrics.persistence.rdbLastSaveTime = parseInt(value) || 0;
          break;
        case 'rdb_changes_since_last_save':
          metrics.persistence.rdbChangesSinceLastSave = parseInt(value) || 0;
          break;
        case 'aof_current_size':
          metrics.persistence.aofCurrentSize = parseInt(value) || 0;
          break;
        case 'aof_base_size':
          metrics.persistence.aofBaseSize = parseInt(value) || 0;
          break;
        case 'latest_fork_usec':
          metrics.persistence.lastForkUsec = parseInt(value) || 0;
          break;
        
        // Client metrics
        case 'connected_clients':
          metrics.clients.connectedClients = parseInt(value) || 0;
          break;
        case 'total_connections_received':
          metrics.clients.totalConnectionsReceived = parseInt(value) || 0;
          break;
        case 'rejected_connections':
          metrics.clients.rejectedConnections = parseInt(value) || 0;
          break;
        case 'maxclients':
          metrics.clients.maxClients = parseInt(value) || 0;
          break;
        
        case 'cmdstat_get':
        case 'cmdstat_mget':
        case 'cmdstat_hget':
        case 'cmdstat_hgetall':
          const readMatch = value.match(/calls=(\d+)/);
          if (readMatch) {
            metrics.operations.reads += parseInt(readMatch[1]) || 0;
          }
          break;
        case 'cmdstat_set':
        case 'cmdstat_mset':
        case 'cmdstat_hset':
        case 'cmdstat_hmset':
        case 'cmdstat_lpush':
        case 'cmdstat_rpush':
        case 'cmdstat_sadd':
        case 'cmdstat_zadd':
          const writeMatch = value.match(/calls=(\d+)/);
          if (writeMatch) {
            metrics.operations.writes += parseInt(writeMatch[1]) || 0;
          }
          break;
        case 'cmdstat_del':
        case 'cmdstat_unlink':
        case 'cmdstat_hdel':
        case 'cmdstat_lpop':
        case 'cmdstat_rpop':
        case 'cmdstat_srem':
        case 'cmdstat_zrem':
          const deleteMatch = value.match(/calls=(\d+)/);
          if (deleteMatch) {
            metrics.operations.deletes += parseInt(deleteMatch[1]) || 0;
          }
          break;
      }
    });
  });

  const totalAccesses = metrics.cacheHits + metrics.cacheMisses;
  metrics.hitRatio = totalAccesses > 0 ? metrics.cacheHits / totalAccesses : 0;
  metrics.overallHitRatio = metrics.hitRatio;
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

    // Get Redis INFO with all sections
    const info = await redis.info('all');
    
    // Get DBSIZE
    const dbSize = await redis.dbsize();
    
    // Get SLOWLOG - this returns an array of arrays
    const slowlogResult = await redis.slowlog('get', 10);
    
    // Transform slowlog data into proper format
    const slowlog = Array.isArray(slowlogResult) ? slowlogResult.map((entry: any[]) => {
      if (Array.isArray(entry) && entry.length >= 4) {
        return {
          id: entry[0],
          timestamp: entry[1],
          duration: entry[2], // in microseconds
          command: Array.isArray(entry[3]) ? entry[3] : [entry[3]],
          clientIp: entry[4] || null,
          clientName: entry[5] || null
        };
      }
      return null;
    }).filter(Boolean) : [];
    
    // Parse metrics from INFO command
    const metrics = parseRedisInfo(info);
    metrics.dbSize = dbSize;
    metrics.slowlog = slowlog;
    
    console.log(`Parsed ${slowlog.length} slowlog entries`);
    
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
