
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RedisConnection } from "@/types/redis";
import { toast } from "sonner";
import { Database, Play, RefreshCw, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RedisConnectionFormProps {
  onConnect: (connection: RedisConnection) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  connectionString?: string;
}

const RedisConnectionForm = ({
  onConnect,
  onDisconnect,
  isConnected,
  connectionString
}: RedisConnectionFormProps) => {
  const [input, setInput] = useState(connectionString || "");
  const [serverName, setServerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleConnect = async () => {
    if (!input.trim()) {
      toast.error("Please enter a Redis connection string");
      return;
    }

    if (!input.startsWith("redis-cli")) {
      toast.error("Connection string must start with 'redis-cli'");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Testing Redis connection...");
      
      // Test the connection using our edge function
      const { data, error } = await supabase.functions.invoke('redis-monitor', {
        body: { connectionString: input }
      });

      console.log("Edge function response:", { data, error });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to connect to Redis server');
      }

      console.log("Connection successful, checking for existing connection...");

      // Check if this connection string already exists
      const { data: existingConnections, error: checkError } = await supabase
        .from('redis_connections')
        .select('id, server_name')
        .eq('connection_string', input);

      if (checkError) throw checkError;

      let connectionData;
      
      if (existingConnections && existingConnections.length > 0) {
        // Preserve existing server name if no new name is provided
        const existingServerName = existingConnections[0].server_name;
        const finalServerName = serverName.trim() || existingServerName || null;
        
        // Update existing connection's last connected time and server name
        const { data: updatedData, error: updateError } = await supabase
          .from('redis_connections')
          .update({ 
            last_connected_at: new Date().toISOString(),
            server_name: finalServerName
          })
          .eq('id', existingConnections[0].id)
          .select('id, server_name')
          .single();

        if (updateError) throw updateError;
        connectionData = updatedData;
        console.log("Updated existing connection, preserved server name:", finalServerName);
      } else {
        // Create new connection
        const { data: newData, error: insertError } = await supabase
          .from('redis_connections')
          .insert({
            connection_string: input,
            server_name: serverName.trim() || null,
            is_active: true,
            user_id: user?.id
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        connectionData = newData;
        console.log("Created new connection");
      }


      if (!connectionData?.id) {
        throw new Error('Failed to get connection ID');
      }

      const connection: RedisConnection = {
        id: connectionData.id,
        connectionString: input,
        serverName: connectionData.server_name || serverName.trim() || undefined,
        isConnected: true,
        lastConnected: new Date()
      };
      
      onConnect(connection);
      toast.success("Connected to Redis server");
    } catch (error) {
      console.error('Redis connection error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to connect to Redis server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-border mb-6">
      <div className="flex items-center mb-4">
        <Database className="h-5 w-5 text-primary mr-2" />
        <h2 className="text-xl font-semibold">Redis Connection</h2>
      </div>
      
      <div className="space-y-4">
        {!isConnected ? (
          <>
            <p className="text-sm text-muted-foreground">
              Enter your Redis CLI connection string and server name to analyze server performance
            </p>
            <div className="space-y-3">
              <Input
                placeholder="Server name (e.g., Production Redis, Cache Server)"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="w-full"
              />
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  placeholder="redis-cli -h localhost -p 6379 -a password"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleConnect} 
                  disabled={isSubmitting}
                  className="md:w-auto w-full"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Connect
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Example: redis-cli -h 192.168.1.100 -p 6379 -a password</p>
              <p className="mt-1">Note: Data is simulated for now. Integration with real Redis server requires backend setup.</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">Connected to Redis</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{connectionString}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onDisconnect}>
              <X className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedisConnectionForm;
