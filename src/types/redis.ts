
export interface CacheLevel {
  level: number;
  hitRatio: number;
  hits: number;
  misses: number;
  totalRequests: number;
  avgResponseTime: number;
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
  instantaneousOpsPerSec?: number;
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
  id?: string; // Added ID field
  connectionString: string; // Full Redis CLI connection string
  host?: string;
  port?: number;
  password?: string;
  isConnected: boolean;
  lastConnected?: Date;
}
