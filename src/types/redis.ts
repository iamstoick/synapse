
export interface CacheLevel {
  level: number;
  hitRatio: number;
  hits: number;
  misses: number;
  totalRequests: number;
  avgResponseTime: number;
}

export interface SlowlogEntry {
  id: number;
  timestamp: number;
  duration: number;
  command: string[];
  clientIp?: string | null;
  clientName?: string | null;
}

export interface RedisPerformanceMetrics {
  timestamp: number;
  cacheLevels: CacheLevel[];
  overallHitRatio: number;
  totalRequests: number;
  avgResponseTime: number;
  memoryUsage: {
    used: number;
    peak: number;
    total: number;
    utilizationPercentage?: number;
  };
  operations: {
    reads: number;
    writes: number;
    deletes: number;
  };
  cpuUtilization?: number;
  dbSize?: number;
  keyspaceHits?: number;
  keyspaceMisses?: number;
  usedCpuSys?: number;
  usedMemoryHuman?: string;
  usedMemoryPeakHuman?: string;
  memFragmentationRatio?: number;
  uptimeInDays?: number;
  uptimeInSeconds?: number;
  instantaneousOpsPerSec?: number;
  slowlog?: SlowlogEntry[];
  memoryAnalysis?: {
    fragmentationRatio: number;
    evictedKeys: number;
    expiredKeys: number;
  };
  persistence?: {
    rdbLastSaveTime: number;
    rdbChangesSinceLastSave: number;
    aofCurrentSize: number;
    aofBaseSize: number;
    lastForkUsec: number;
  };
  clients?: {
    connectedClients: number;
    totalConnectionsReceived: number;
    rejectedConnections: number;
    maxClients: number;
  };
  cpuUsage?: {
    usedCpuSys: number;
    usedCpuUser: number;
    instantaneousCpuPercentage: number;
  };
}

export interface TimeSeriesData {
  time: string;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  overall: number;
}

export interface RedisConnection {
  id?: string;
  connectionString: string;
  host?: string;
  port?: number;
  password?: string;
  isConnected: boolean;
  lastConnected?: Date;
}
