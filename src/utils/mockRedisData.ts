
import { CacheLevel, RedisPerformanceMetrics, TimeSeriesData } from "@/types/redis";

// Generate a random number between min and max
const getRandomNumber = (min: number, max: number): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// Generate a cache level with random metrics
const generateCacheLevel = (level: number): CacheLevel => {
  const totalRequests = Math.floor(getRandomNumber(1000, 10000));
  const hits = Math.floor(getRandomNumber(totalRequests * 0.4, totalRequests * 0.95));
  const misses = totalRequests - hits;
  const hitRatio = parseFloat((hits / totalRequests).toFixed(2));
  
  return {
    level,
    hitRatio,
    hits,
    misses,
    totalRequests,
    avgResponseTime: getRandomNumber(0.5, 10)
  };
};

// Generate mock Redis performance metrics
export const generateMockRedisMetrics = (): RedisPerformanceMetrics => {
  const cacheLevels = [1, 2, 3, 4].map(level => generateCacheLevel(level));
  
  // Calculate overall metrics
  const totalRequests = cacheLevels.reduce((sum, level) => sum + level.totalRequests, 0);
  const totalHits = cacheLevels.reduce((sum, level) => sum + level.hits, 0);
  
  return {
    timestamp: Date.now(),
    cacheLevels,
    overallHitRatio: parseFloat((totalHits / totalRequests).toFixed(2)),
    totalRequests,
    avgResponseTime: parseFloat((cacheLevels.reduce((sum, level) => sum + level.avgResponseTime, 0) / cacheLevels.length).toFixed(2)),
    memoryUsage: {
      used: getRandomNumber(100, 500),
      peak: getRandomNumber(500, 800),
      total: 1024
    },
    operations: {
      reads: Math.floor(getRandomNumber(5000, 20000)),
      writes: Math.floor(getRandomNumber(1000, 5000)),
      deletes: Math.floor(getRandomNumber(100, 1000))
    }
  };
};

// Generate historical data for time series charts
export const generateTimeSeriesData = (hours = 24): TimeSeriesData[] => {
  const now = new Date();
  const data: TimeSeriesData[] = [];
  
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    data.push({
      time,
      level1: parseFloat(getRandomNumber(0.7, 0.98).toFixed(2)),
      level2: parseFloat(getRandomNumber(0.6, 0.9).toFixed(2)),
      level3: parseFloat(getRandomNumber(0.5, 0.85).toFixed(2)),
      level4: parseFloat(getRandomNumber(0.4, 0.8).toFixed(2)),
      overall: parseFloat(getRandomNumber(0.65, 0.95).toFixed(2))
    });
  }
  
  return data;
};

// Simulate real-time data refresh (for use with useEffect and useState)
export const refreshData = (
  setMetrics: React.Dispatch<React.SetStateAction<RedisPerformanceMetrics>>,
  setTimeSeriesData: React.Dispatch<React.SetStateAction<TimeSeriesData[]>>
) => {
  const newMetrics = generateMockRedisMetrics();
  setMetrics(newMetrics);
  
  setTimeSeriesData(prevData => {
    const newData = [...prevData];
    if (newData.length > 24) {
      newData.shift(); // Remove oldest data point
    }
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    newData.push({
      time,
      level1: newMetrics.cacheLevels[0].hitRatio,
      level2: newMetrics.cacheLevels[1].hitRatio,
      level3: newMetrics.cacheLevels[2].hitRatio,
      level4: newMetrics.cacheLevels[3].hitRatio,
      overall: newMetrics.overallHitRatio
    });
    
    return newData;
  });
};
