
import { useState, useEffect } from "react";
import { RedisPerformanceMetrics, TimeSeriesData } from "@/types/redis";
import { generateMockRedisMetrics, generateTimeSeriesData, refreshData } from "@/utils/mockRedisData";
import Header from "@/components/dashboard/Header";
import HitRatioGauge from "@/components/dashboard/HitRatioGauge";
import HitRatioChart from "@/components/dashboard/HitRatioChart";
import MemoryUsage from "@/components/dashboard/MemoryUsage";
import OperationsChart from "@/components/dashboard/OperationsChart";
import Navbar from "@/components/dashboard/Navbar";
import CacheHitTrend from "@/components/dashboard/CacheHitTrend";
import InfoPanel from "@/components/dashboard/InfoPanel";

const Index = () => {
  // State for Redis metrics and time series data
  const [metrics, setMetrics] = useState<RedisPerformanceMetrics>(generateMockRedisMetrics());
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>(generateTimeSeriesData());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Function to manually refresh data
  const handleRefresh = () => {
    refreshData(setMetrics, setTimeSeriesData);
    setLastUpdated(new Date());
  };
  
  // Refresh data every 10 seconds
  useEffect(() => {
    // Initial data load
    handleRefresh();
    
    // Set up interval for refreshing data
    const interval = setInterval(handleRefresh, 10000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar onRefresh={handleRefresh} lastUpdated={lastUpdated} />
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header with key metrics */}
        <Header metrics={metrics} />
        
        {/* Cache hit ratio gauges */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Cache Hit Ratio by Level</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-card p-6 rounded-lg shadow-sm">
            {metrics.cacheLevels.map((level) => (
              <div key={level.level} className="text-center">
                <HitRatioGauge cacheLevel={level} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Main chart showing hit ratio over time */}
        <div className="mb-6">
          <HitRatioChart data={timeSeriesData} />
        </div>
        
        {/* Cache hit trends */}
        <div className="mb-6 bg-card p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Cache Hit Trends</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CacheHitTrend data={timeSeriesData} level={1} className="bg-blue-50" />
            <CacheHitTrend data={timeSeriesData} level={2} className="bg-indigo-50" />
            <CacheHitTrend data={timeSeriesData} level={3} className="bg-purple-50" />
            <CacheHitTrend data={timeSeriesData} level={4} className="bg-violet-50" />
          </div>
        </div>
        
        {/* Additional metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <MemoryUsage metrics={metrics} />
          <OperationsChart metrics={metrics} />
        </div>
        
        {/* Health assessment */}
        <div className="mb-6">
          <InfoPanel metrics={metrics} />
        </div>
        
        {/* Footer with info */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>Redis Cache Oracle • Refreshes every 10 seconds • Using simulated data</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
