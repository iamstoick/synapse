
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
}

export interface TimeSeriesData {
  time: string;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  overall: number;
}
