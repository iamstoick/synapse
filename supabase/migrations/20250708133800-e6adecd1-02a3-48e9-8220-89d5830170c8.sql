
-- Add server_name column to redis_connections table
ALTER TABLE public.redis_connections 
ADD COLUMN IF NOT EXISTS server_name TEXT;

-- Create table to track uptime history for reboot detection
CREATE TABLE IF NOT EXISTS public.redis_uptime_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES redis_connections(id) ON DELETE CASCADE,
  uptime_seconds INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_rebooted BOOLEAN DEFAULT false
);

-- Add RLS policies for uptime history
ALTER TABLE public.redis_uptime_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view uptime history for their connections" 
  ON public.redis_uptime_history 
  FOR SELECT 
  USING (
    connection_id IN (
      SELECT id FROM redis_connections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert uptime history for their connections" 
  ON public.redis_uptime_history 
  FOR INSERT 
  WITH CHECK (
    connection_id IN (
      SELECT id FROM redis_connections WHERE user_id = auth.uid()
    )
  );

-- Function to detect server reboots and insert uptime history
CREATE OR REPLACE FUNCTION public.track_uptime_and_detect_reboots()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  last_uptime INTEGER;
  server_rebooted BOOLEAN := false;
BEGIN
  -- Get the last recorded uptime for this connection
  SELECT uptime_seconds INTO last_uptime
  FROM redis_uptime_history 
  WHERE connection_id = NEW.connection_id 
  ORDER BY recorded_at DESC 
  LIMIT 1;

  -- If we have a previous record and current uptime is less than last uptime, server rebooted
  IF last_uptime IS NOT NULL AND NEW.uptime_in_seconds < last_uptime THEN
    server_rebooted := true;
  END IF;

  -- Insert the uptime history record
  INSERT INTO redis_uptime_history (connection_id, uptime_seconds, server_rebooted)
  VALUES (NEW.connection_id, NEW.uptime_in_seconds, server_rebooted);

  RETURN NEW;
END;
$function$;

-- Create trigger to automatically track uptime when metrics are inserted
CREATE TRIGGER track_uptime_trigger
  AFTER INSERT ON redis_metrics
  FOR EACH ROW
  EXECUTE FUNCTION track_uptime_and_detect_reboots();
