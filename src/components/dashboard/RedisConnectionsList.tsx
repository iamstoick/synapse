import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RedisConnection } from "@/types/redis";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database, Play, X, Trash2, ChevronDown, ChevronRight, Edit2, Check, X as XIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RedisConnectionsListProps {
  onConnect: (connection: RedisConnection) => void;
  currentConnectionId?: string;
}

const RedisConnectionsList = ({ onConnect, currentConnectionId }: RedisConnectionsListProps) => {
  const [connections, setConnections] = useState<RedisConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<{ id: string; name?: string } | null>(null);
  const { user } = useAuth();

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

  const handleDeleteClick = (connectionId: string, serverName?: string) => {
    setConnectionToDelete({ id: connectionId, name: serverName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!connectionToDelete) return;

    try {
      // Delete the connection - this will cascade delete all related data
      const { error } = await supabase
        .from('redis_connections')
        .delete()
        .eq('id', connectionToDelete.id);

      if (error) throw error;

      setConnections(prev => prev.filter(conn => conn.id !== connectionToDelete.id));
      
      toast.success(`Deleted connection and historical data for ${connectionToDelete.name || 'Redis server'}`);
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast.error('Failed to delete connection');
    } finally {
      setDeleteDialogOpen(false);
      setConnectionToDelete(null);
    }
  };

  const handleEditName = (connectionId: string, currentName: string) => {
    setEditingId(connectionId);
    setEditingName(currentName || "");
  };

  const handleSaveName = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('redis_connections')
        .update({ server_name: editingName.trim() || null })
        .eq('id', connectionId);

      if (error) throw error;

      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, serverName: editingName.trim() || undefined }
          : conn
      ));
      
      setEditingId(null);
      setEditingName("");
      toast.success('Server name updated');
    } catch (error) {
      console.error('Error updating server name:', error);
      toast.error('Failed to update server name');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card rounded-lg border border-border">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold">Saved Connections</h2>
              {connections.length > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({connections.length})
                </span>
              )}
            </div>
            {isOpen ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-6 pb-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading connections...</p>
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No saved connections yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect to a Redis server above to save your first connection
                </p>
              </div>
            ) : (
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
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {editingId === connection.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  placeholder="Server name"
                                  className="h-8 text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveName(connection.id!);
                                    } else if (e.key === 'Escape') {
                                      handleCancelEdit();
                                    }
                                  }}
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSaveName(connection.id!)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancelEdit}
                                  className="h-6 w-6 p-0"
                                >
                                  <XIcon className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {connection.serverName || 'Unnamed Server'}
                                </h3>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditName(connection.id!, connection.serverName || "")}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
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
                        onClick={() => handleDeleteClick(connection.id!, connection.serverName)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {connectionToDelete?.name ? `"${connectionToDelete.name}"` : 'this connection'}? 
              This will permanently remove the connection and <strong>all associated historical data</strong> including 
              metrics, uptime history, and reboot logs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Connection & Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Collapsible>
  );
};

export default RedisConnectionsList;