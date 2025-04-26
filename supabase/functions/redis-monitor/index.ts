
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { connect } from "https://deno.land/x/redis@v0.29.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { connectionString } = await req.json()

    // Parse Redis connection string
    // Example format: "redis-cli -h localhost -p 6379 -a password"
    const parts = connectionString.split(' ')
    const host = parts[parts.indexOf('-h') + 1] || 'localhost'
    const port = parseInt(parts[parts.indexOf('-p') + 1]) || 6379
    const password = parts[parts.indexOf('-a') + 1] || undefined

    // Connect to Redis
    const redis = await connect({
      hostname: host,
      port: port,
      password: password,
    })

    // Get Redis INFO
    const info = await redis.info()
    
    // Parse metrics from INFO command
    const metrics = parseRedisInfo(info)
    
    // Close Redis connection
    await redis.close()

    return new Response(JSON.stringify({ 
      success: true,
      metrics: metrics 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Redis connection error:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

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
    operations: {
      reads: 0,
      writes: 0,
      deletes: 0,
    },
    cacheLevels: []
  }

  const sections = info.split('\n\n')
  sections.forEach(section => {
    const lines = section.split('\n')
    lines.forEach(line => {
      if (line.startsWith('#')) return
      
      const [key, value] = line.split(':')
      if (!key || !value) return

      switch (key.trim()) {
        case 'used_memory':
          metrics.memoryUsed = parseInt(value)
          break
        case 'used_memory_peak':
          metrics.memoryPeak = parseInt(value)
          break
        case 'total_system_memory':
          metrics.memoryTotal = parseInt(value)
          break
        case 'total_commands_processed':
          metrics.totalCommands = parseInt(value)
          break
        case 'keyspace_hits':
          metrics.cacheHits = parseInt(value)
          break
        case 'keyspace_misses':
          metrics.cacheMisses = parseInt(value)
          break
        case 'used_cpu_sys':
          metrics.cpuUtilization = parseFloat(value)
          break
      }
    })
  })

  // Calculate hit ratio
  const totalAccesses = metrics.cacheHits + metrics.cacheMisses
  metrics.hitRatio = totalAccesses > 0 ? metrics.cacheHits / totalAccesses : 0

  return metrics
}
