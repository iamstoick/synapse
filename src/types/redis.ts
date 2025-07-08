
export interface RedisInfo {
  redis_version: string;
  redis_mode: string;
  os: string;
  arch_bits: number;
  uptime_in_seconds: number;
  connected_clients: number;
  used_memory: number;
  used_memory_peak: number;
  used_memory_rss: number;
  used_memory_overhead: number;
  used_memory_data: number;
  total_system_memory: number;
  peak_memory_consumption: number;
  used_cpu_sys: number;
  used_cpu_user: number;
  keyspace_hits: number;
  keyspace_misses: number;
  total_connections_received: number;
  total_commands_processed: number;
  instantaneous_ops_per_sec: number;
  total_net_input_bytes: number;
  total_net_output_bytes: number;
  evicted_keys: number;
  expired_keys: number;
  blocked_clients: number;
  keyspace: {
    [db: string]: {
      keys: number;
      expires: number;
      avg_ttl: number;
    };
  };
  role: string;
  master_host?: string;
  master_port?: number;
  connected_slaves?: number;
  loading?: number;
  rdb_changes_since_last_save?: number;
  rdb_bgsave_in_progress?: number;
  rdb_last_save_time?: number;
  aof_enabled?: number;
  aof_rewrite_in_progress?: number;
  aof_fsync_pending?: number;
  latest_fork_usec?: number;
  used_memory_lua?: number;
  maxmemory?: number;
  maxmemory_policy?: string;
  mem_fragmentation_ratio?: number;
  connected_clients_delta?: number;
  used_memory_human?: string;
  used_memory_peak_human?: string;
  used_memory_rss_human?: string;
  lru_clock?: number;
  executable?: string;
  config_file?: string;
  hz?: number;
  tcp_port?: number;
  uptime_in_days?: number;
  used_memory_dataset?: number;
  master_link_status?: string;
  master_sync_in_progress?: number;
  slave_repl_offset?: number;
  slave_priority?: number;
  master_link_down_since_seconds?: number;
  aof_current_size?: number;
  aof_base_size?: number;
  aof_pending_rewrite?: number;
  aof_last_rewrite_time_sec?: number;
  aof_current_rewrite_time_sec?: number;
  aof_last_bgrewrite_status?: string;
  cluster_enabled?: number;
  cluster_slots_assigned?: number;
  cluster_slots_ok?: number;
  cluster_slots_pfail?: number;
  cluster_slots_fail?: number;
  cluster_known_nodes?: number;
  cluster_size?: number;
  migrate_cached_sockets?: number;
  tracking_clients?: number;
  pending_commands?: number;
  io_threads_active?: number;
  total_reads_processed?: number;
  total_writes_processed?: number;
  instantaneous_input_kbps?: number;
  instantaneous_output_kbps?: number;
  rejected_connections?: number;
  sync_full?: number;
  sync_partial_ok?: number;
  sync_partial_err?: number;
  expired_time_cap_reached_count?: number;
  total_system_memory_human?: string;
  maxmemory_human?: string;
  used_memory_lua_human?: string;
  used_memory_dataset_human?: string;
  aof_current_size_human?: string;
  aof_base_size_human?: string;
  used_memory_scripts_human?: string;
  used_memory_functions_human?: string;
  total_forks?: number;
}

export interface MemoryMetrics {
  used: number;
  peak: number;
  total: number;
  utilizationPercentage?: number;
}

export interface OperationsMetrics {
  reads: number;
  writes: number;
  deletes: number;
}

export interface CacheLevel {
  level: number;
  hits: number;
  misses: number;
  hitRatio: number;
  totalRequests: number;
  avgResponseTime: number;
}

export interface CacheLevels {
  l1_hit_ratio?: number;
  l2_hit_ratio?: number;
  l3_hit_ratio?: number;
}

export interface MemoryAnalysisMetrics {
  fragmentationRatio: number;
  memoryWasted: number;
  evictedKeys: number;
  expiredKeys: number;
}

export interface PersistenceMetrics {
  rdbLastSaveTime: number;
  rdbChangesSinceLastSave: number;
  aofCurrentSize: number;
  aofBaseSize: number;
  lastForkUsec: number;
  rdbLastBgsaveTimeSec?: number;
  currentCowSize?: number;
  currentForkPerc?: number;
  rdbLastCowSize?: number;
  rdbBgsaveInProgress?: number;
  totalForks?: number;
}

export interface ClientsMetrics {
  connectedClients: number;
  totalConnectionsReceived: number;
  rejectedConnections: number;
  maxClients: number;
}

export interface CpuUsageMetrics {
  usedCpuSys: number;
  usedCpuUser: number;
  instantaneousCpuPercentage: number;
}

export interface SlowlogEntry {
  id: number;
  timestamp: number;
  duration: number;
  command: string[];
  clientIp: string;
  clientName?: string;
}

export interface TimeSeriesData {
  time: string;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  overall: number;
}

export interface RedisPerformanceMetrics {
  redisVersion: string;
  uptimeInSeconds: number;
  connectedClients: number;
  memoryUsage: MemoryMetrics;
  cpuUtilization: number;
  keyspaceHits: number;
  keyspaceMisses: number;
  totalCommands: number;
  totalRequests: number;
  instantaneousOpsPerSec?: number;
  avgResponseTime: number;
  operations: OperationsMetrics;
  cacheLevels?: CacheLevel[];
  overallHitRatio: number;
  memoryAnalysis?: MemoryAnalysisMetrics;
  persistence?: PersistenceMetrics;
  clients?: ClientsMetrics;
  cpuUsage?: CpuUsageMetrics;
  slowlog?: SlowlogEntry[];
  dbSize?: number;
  timestamp?: number;
}

export interface RedisConnection {
  id?: string;
  connectionString: string;
  serverName?: string;
  isConnected?: boolean;
  lastConnected?: Date;
}
