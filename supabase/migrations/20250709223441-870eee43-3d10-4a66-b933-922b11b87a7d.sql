-- Enable authentication and ensure proper user isolation for Redis connections
-- This migration adds proper user authentication requirements and cascade deletes

-- First, let's ensure the profiles table exists for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Update redis_connections to require authentication
-- Remove the overly permissive policies first
DROP POLICY IF EXISTS "redis_connections_select_policy" ON public.redis_connections;
DROP POLICY IF EXISTS "redis_connections_insert_policy" ON public.redis_connections;
DROP POLICY IF EXISTS "redis_connections_update_policy" ON public.redis_connections;
DROP POLICY IF EXISTS "redis_connections_delete_policy" ON public.redis_connections;

-- Ensure redis_connections requires user_id (remove demo access)
ALTER TABLE public.redis_connections ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policies for redis_connections to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own connections" ON public.redis_connections;
DROP POLICY IF EXISTS "Users can insert their own connections" ON public.redis_connections;
DROP POLICY IF EXISTS "Users can update their own connections" ON public.redis_connections;
DROP POLICY IF EXISTS "Users can delete their own connections" ON public.redis_connections;

-- Update redis_connections policies to be more restrictive
CREATE POLICY "Users can only view their own connections" 
ON public.redis_connections 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own connections" 
ON public.redis_connections 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own connections" 
ON public.redis_connections 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own connections" 
ON public.redis_connections 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Update redis_metrics policies to remove demo access
DROP POLICY IF EXISTS "Anonymous demo access to metrics" ON public.redis_metrics;
DROP POLICY IF EXISTS "redis_metrics_select_policy" ON public.redis_metrics;
DROP POLICY IF EXISTS "redis_metrics_insert_policy" ON public.redis_metrics;
DROP POLICY IF EXISTS "Users can view metrics for their connections" ON public.redis_metrics;
DROP POLICY IF EXISTS "Users can insert metrics for their connections" ON public.redis_metrics;

-- Ensure only authenticated users can access metrics for their connections
CREATE POLICY "Users can only view metrics for their connections" 
ON public.redis_metrics 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM redis_connections 
  WHERE redis_connections.id = redis_metrics.connection_id 
  AND redis_connections.user_id = auth.uid()
));

CREATE POLICY "Users can only insert metrics for their connections" 
ON public.redis_metrics 
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM redis_connections 
  WHERE redis_connections.id = redis_metrics.connection_id 
  AND redis_connections.user_id = auth.uid()
));

-- Drop existing uptime history policies
DROP POLICY IF EXISTS "Users can view uptime history for their connections" ON public.redis_uptime_history;
DROP POLICY IF EXISTS "Users can insert uptime history for their connections" ON public.redis_uptime_history;

-- Update redis_uptime_history policies to be more restrictive
CREATE POLICY "Users can only view uptime history for their connections" 
ON public.redis_uptime_history 
FOR SELECT 
TO authenticated
USING (connection_id IN (
  SELECT id FROM redis_connections 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can only insert uptime history for their connections" 
ON public.redis_uptime_history 
FOR INSERT 
TO authenticated
WITH CHECK (connection_id IN (
  SELECT id FROM redis_connections 
  WHERE user_id = auth.uid()
));

-- Drop existing reboot policies
DROP POLICY IF EXISTS "Allow authenticated users to view their own reboots." ON public.redis_reboots;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own reboots." ON public.redis_reboots;

-- Update redis_reboots policies to be more restrictive
CREATE POLICY "Users can only view reboots for their connections" 
ON public.redis_reboots 
FOR SELECT 
TO authenticated
USING (connection_id IN (
  SELECT id FROM redis_connections 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can only insert reboots for their connections" 
ON public.redis_reboots 
FOR INSERT 
TO authenticated
WITH CHECK (connection_id IN (
  SELECT id FROM redis_connections 
  WHERE user_id = auth.uid()
));

-- Add foreign key constraints to ensure data integrity and enable cascade deletes
ALTER TABLE public.redis_metrics 
DROP CONSTRAINT IF EXISTS redis_metrics_connection_id_fkey;

ALTER TABLE public.redis_metrics 
ADD CONSTRAINT redis_metrics_connection_id_fkey 
FOREIGN KEY (connection_id) 
REFERENCES public.redis_connections(id) 
ON DELETE CASCADE;

ALTER TABLE public.redis_uptime_history 
DROP CONSTRAINT IF EXISTS redis_uptime_history_connection_id_fkey;

ALTER TABLE public.redis_uptime_history 
ADD CONSTRAINT redis_uptime_history_connection_id_fkey 
FOREIGN KEY (connection_id) 
REFERENCES public.redis_connections(id) 
ON DELETE CASCADE;

ALTER TABLE public.redis_reboots 
DROP CONSTRAINT IF EXISTS redis_reboots_connection_id_fkey;

ALTER TABLE public.redis_reboots 
ADD CONSTRAINT redis_reboots_connection_id_fkey 
FOREIGN KEY (connection_id) 
REFERENCES public.redis_connections(id) 
ON DELETE CASCADE;

-- Create trigger for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();