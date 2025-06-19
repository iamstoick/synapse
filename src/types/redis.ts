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
  active_defrag_hits?: number;
  active_defrag_misses?: number;
  active_defrag_key_hits?: number;
  active_defrag_key_misses?: number;
  active_defrag_running?: number;
  active_defrag_time_elapsed?: number;
  active_defrag_estimated_gain?: number;
  active_defrag_fragmentation_wasted?: number;
  active_defrag_cycle_fast?: number;
  active_defrag_cycle_slow?: number;
  active_defrag_last_effort?: number;
  active_defrag_throttle_max_bytes?: number;
  active_defrag_max_scan_fields?: number;
  active_defrag_threshold_lower?: number;
  active_defrag_running_time_ms?: number;
  active_defrag_sync_time_ms?: number;
  active_defrag_aborted?: number;
  active_defrag_oom_count?: number;
  active_defrag_key_count?: number;
  active_defrag_keys_skipped?: number;
  active_defrag_work_done?: number;
  active_defrag_scan_time?: number;
  active_defrag_freelist_compaction_count?: number;
  active_defrag_freelist_compaction_time?: number;
  active_defrag_freelist_rebuild_count?: number;
  active_defrag_freelist_rebuild_time?: number;
  active_defrag_last_scan_time?: number;
  active_defrag_last_work_done?: number;
  active_defrag_last_keys_skipped?: number;
  active_defrag_last_freelist_compaction_count?: number;
  active_defrag_last_freelist_compaction_time?: number;
  active_defrag_last_freelist_rebuild_count?: number;
  active_defrag_last_freelist_rebuild_time?: number;
  active_defrag_last_oom_count?: number;
  active_defrag_last_key_count?: number;
  active_defrag_last_aborted?: number;
  active_defrag_last_estimated_gain?: number;
  active_defrag_last_fragmentation_wasted?: number;
  active_defrag_last_cycle_fast?: number;
  active_defrag_last_cycle_slow?: number;
  active_defrag_last_throttle_max_bytes?: number;
  active_defrag_last_max_scan_fields?: number;
  active_defrag_last_threshold_lower?: number;
  active_defrag_last_running_time_ms?: number;
  active_defrag_last_sync_time_ms?: number;
  active_defrag_last_scan_fields?: number;
  active_defrag_last_scan_fields_count?: number;
  active_defrag_last_scan_fields_time?: number;
  active_defrag_last_scan_fields_aborted?: number;
  active_defrag_last_scan_fields_oom?: number;
  active_defrag_last_scan_fields_key_count?: number;
  active_defrag_last_scan_fields_keys_skipped?: number;
  active_defrag_last_scan_fields_work_done?: number;
  active_defrag_last_scan_fields_freelist_compaction_count?: number;
  active_defrag_last_scan_fields_freelist_compaction_time?: number;
  active_defrag_last_scan_fields_freelist_rebuild_count?: number;
  active_defrag_last_scan_fields_freelist_rebuild_time?: number;
  active_defrag_last_scan_fields_oom_count?: number;
  active_defrag_last_scan_fields_key_count_count?: number;
  active_defrag_last_scan_fields_keys_skipped_count?: number;
  active_defrag_last_scan_fields_work_done_count?: number;
  active_defrag_last_scan_fields_freelist_compaction_count_count?: number;
  active_defrag_last_scan_fields_freelist_compaction_time_count?: number;
  active_defrag_last_scan_fields_freelist_rebuild_count_count?: number;
  active_defrag_last_scan_fields_freelist_rebuild_time_count?: number;
  active_defrag_last_scan_fields_oom_count_count?: number;
  active_defrag_last_scan_fields_key_count_count_count?: number;
  active_defrag_last_scan_fields_keys_skipped_count_count?: number;
  active_defrag_last_scan_fields_work_done_count_count?: number;
  active_defrag_last_scan_fields_freelist_compaction_count_count_count?: number;
  active_defrag_last_scan_fields_freelist_compaction_time_count_count?: number;
  active_defrag_last_scan_fields_freelist_rebuild_count_count_count?: number;
  active_defrag_last_scan_fields_freelist_rebuild_time_count_count?: number;
  active_defrag_last_scan_fields_oom_count_count_count?: number;
  active_defrag_last_scan_fields_key_count_count_count_count?: number;
  active_defrag_last_scan_fields_keys_skipped_count_count_count_count?: number;
  active_defrag_last_scan_fields_work_done_count_count_count_count?: number;
  active_defrag_last_scan_fields_freelist_compaction_count_count_count_count?: number;
  active_defrag_last_scan_fields_freelist_compaction_time_count_count_count_count?: number;
  active_defrag_last_scan_fields_freelist_rebuild_count_count_count_count?: number;
  active_defrag_last_scan_fields_freelist_rebuild_time_count_count_count_count?: number;
  active_defrag_last_scan_fields_oom_count_count_count_count?: number;
  active_defrag_last_scan_fields_key_count_count_count_count_count?: number;
  active_defrag_last_scan_fields_keys_skipped_count_count_count_count_count?: number;
  active_defrag_last_scan_fields_work_done_count_count_count_count_count?: number;
  active_defrag_last_scan_fields_freelist_compaction_count_count_count_count_count?: number;
  active_defrag_last_scan_fields_freelist_compaction_time_count_count_count_count_count?: number;
  active_defrag_last_scan_fields_freelist_rebuild_count_count_count_count_count?: number;
  active_defrag_last_scan_fields_freelist_rebuild_time_count_count_count_count_count?: number;
  active_defrag_last_scan_fields_oom_count_count_count_count_count?: number;
  active_defrag_last_scan_fields_key_count_count_count_count_count_count?: number;
  active_defrag_last_scan_fields_keys_skipped_count_count_count_count_count_count?: number;
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

export interface CacheLevels {
  l1_hit_ratio?: number;
  l2_hit_ratio?: number;
  l3_hit_ratio?: number;
}

export interface MemoryAnalysisMetrics {
  fragmentationRatio: number;
  memoryWasted: number;
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
}

export interface RedisPerformanceMetrics {
  redisVersion: string;
  uptimeInSeconds: number;
  connectedClients: number;
  memoryUsage: MemoryMetrics;
  cpuUtilization: number;
  keyspaceHits: number;
  keyspaceMisses: number;
  totalRequests: number;
  instantaneousOpsPerSec?: number;
  avgResponseTime: number;
  operations: OperationsMetrics;
  cacheLevels?: CacheLevels;
  overallHitRatio: number;
  memoryAnalysis?: MemoryAnalysisMetrics;
  persistence?: PersistenceMetrics;
}

export interface RedisConnection {
  id?: string;
  connectionString: string;
  isConnected?: boolean;
}
