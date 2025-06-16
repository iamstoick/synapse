
-- Enable realtime for the redis_metrics table
ALTER TABLE public.redis_metrics REPLICA IDENTITY FULL;

-- Add the table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.redis_metrics;

-- Create a function to calculate derived metrics
CREATE OR REPLACE FUNCTION public.calculate_redis_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate hit ratio if we have hits and misses
  IF NEW.cache_hits IS NOT NULL AND NEW.cache_misses IS NOT NULL THEN
    NEW.hit_ratio = CASE 
      WHEN (NEW.cache_hits + NEW.cache_misses) > 0 
      THEN NEW.cache_hits::numeric / (NEW.cache_hits + NEW.cache_misses)
      ELSE 0
    END;
  END IF;

  -- Ensure timestamp is set
  IF NEW.timestamp IS NULL THEN
    NEW.timestamp = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate metrics on insert/update
DROP TRIGGER IF EXISTS calculate_metrics_trigger ON public.redis_metrics;
CREATE TRIGGER calculate_metrics_trigger
  BEFORE INSERT OR UPDATE ON public.redis_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_redis_metrics();

-- Create an index for better performance on connection_id and timestamp
CREATE INDEX IF NOT EXISTS idx_redis_metrics_connection_timestamp 
ON public.redis_metrics(connection_id, timestamp DESC);
