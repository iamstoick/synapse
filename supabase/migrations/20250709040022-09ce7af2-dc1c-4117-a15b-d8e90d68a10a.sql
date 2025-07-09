-- Update the uptime tracking function to improve reboot detection
-- and calculate estimated reboot time
CREATE OR REPLACE FUNCTION public.track_uptime_and_detect_reboots()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
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
$function$;