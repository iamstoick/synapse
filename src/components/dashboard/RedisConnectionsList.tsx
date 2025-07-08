import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RedisConnection } from "@/types/redis";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database, Play, X, Trash2 } from "lucide-react";

interface RedisConnectionsListProps {
  onConnect: (connection: RedisConnection) => void;
  currentConnectionId?: string;
}

const RedisConnectionsList = ({ onConnect, currentConnectionId }: RedisConnectionsListProps) => {
  const [connections, setConnections] = useState<RedisConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('redis_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedConnections: RedisConnection[] = data.map(conn => ({
        id: conn.id,
        connectionString: conn.connection_string,
        serverName: conn.server_name,
        isConnected: conn.id === currentConnectionId,
        lastConnected: conn.last_connected_at ? new Date(conn.last_connected_at) : undefined
      }));

      setConnections(formattedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load saved connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [currentConnectionId]);

  const handleConnect = async (connection: RedisConnection) => {
    try {
      // Update last_connected_at in database
      const { error } = await supabase
        .from('redis_connections')
        .update({ last_connected_at: new Date().toISOString() })
        .eq('id', connection.id);

      if (error) throw error;

      onConnect(connection);
      toast.success(`Connected to ${connection.serverName || 'Redis server'}`);
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Failed to connect to server');
    }
  };

  const handleDelete = async (connectionId: string, serverName?: string) => {
    try {
      const { error } = await supabase
        .from('redis_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      toast.success(`Deleted connection to ${serverName || 'Redis server'}`);
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast.error('Failed to delete connection');
    }
  };

  if (loading) {
    return (
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center mb-4">
          <Database className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-semibold">Saved Connections</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading connections...</p>
        </div>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center mb-4">
          <Database className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-semibold">Saved Connections</h2>
        </div>
        <div className="text-center py-8">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No saved connections yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Connect to a Redis server above to save your first connection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex items-center mb-4">
        <Database className="h-5 w-5 text-primary mr-2" />
        <h2 className="text-xl font-semibold">Saved Connections</h2>
      </div>
      
      <div className="space-y-3">
        {connections.map((connection) => (
          <div
            key={connection.id}
            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
          >
            <div className="flex-1">
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-3 ${
                  connection.isConnected ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <div>
                  <h3 className="font-medium">
                    {connection.serverName || 'Unnamed Server'}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate max-w-md">
                    {connection.connectionString}
                  </p>
                  {connection.lastConnected && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last connected: {connection.lastConnected.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {connection.isConnected ? (
                <Button variant="outline" size="sm" disabled>
                  <X className="h-4 w-4 mr-1" />
                  Connected
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleConnect(connection)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Connect
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(connection.id!, connection.serverName)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RedisConnectionsList;