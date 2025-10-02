-- Critical Security Fixes Migration

-- 1. Add INSERT policy for mysql_metrics table
CREATE POLICY "Users can insert metrics for their connections"
ON mysql_metrics
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM mysql_connections
    WHERE mysql_connections.id = mysql_metrics.connection_id
      AND mysql_connections.user_id = auth.uid()
  )
);

-- 2. Fix database functions to include SET search_path for security
-- Recreate handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Recreate calculate_redis_metrics function with proper search_path
CREATE OR REPLACE FUNCTION public.calculate_redis_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

-- Recreate track_uptime_and_detect_reboots function with proper search_path
CREATE OR REPLACE FUNCTION public.track_uptime_and_detect_reboots()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  last_uptime INTEGER;
  last_recorded_at TIMESTAMP WITH TIME ZONE;
  server_rebooted BOOLEAN := false;
  estimated_reboot_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the last recorded uptime and timestamp for this connection
  SELECT uptime_seconds, recorded_at INTO last_uptime, last_recorded_at
  FROM redis_uptime_history 
  WHERE connection_id = NEW.connection_id 
  ORDER BY recorded_at DESC 
  LIMIT 1;

  -- If we have a previous record and current uptime is less than last uptime, server rebooted
  IF last_uptime IS NOT NULL AND NEW.uptime_in_seconds < last_uptime THEN
    server_rebooted := true;
    
    -- Calculate estimated reboot time: current_timestamp - current_uptime_seconds
    estimated_reboot_time := NOW() - (NEW.uptime_in_seconds || ' seconds')::INTERVAL;
  END IF;

  -- Insert the uptime history record
  INSERT INTO redis_uptime_history (connection_id, uptime_seconds, server_rebooted)
  VALUES (NEW.connection_id, NEW.uptime_in_seconds, server_rebooted);

  -- If a reboot was detected, also log it in the redis_reboots table
  IF server_rebooted THEN
    INSERT INTO redis_reboots (connection_id, reboot_time, previous_uptime_seconds)
    VALUES (NEW.connection_id, estimated_reboot_time, last_uptime);
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Add comment to mysql_connections.password column for encryption guidance
COMMENT ON COLUMN mysql_connections.password IS 'Database password - should be encrypted by application layer before storage';

-- 4. Add comment to redis_connections.password column for encryption guidance
COMMENT ON COLUMN redis_connections.password IS 'Redis password - should be encrypted by application layer before storage';