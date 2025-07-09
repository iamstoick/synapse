import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface UptimeRecord {
  id: string;
  uptime_seconds: number;
  recorded_at: string;
  server_rebooted: boolean;
}

interface UptimeHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  connectionId?: string;
}

const UptimeHistoryDialog = ({ isOpen, onClose, connectionId }: UptimeHistoryDialogProps) => {
  const [uptimeHistory, setUptimeHistory] = useState<UptimeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && connectionId) {
      fetchUptimeHistory();
    }
  }, [isOpen, connectionId]);

  const fetchUptimeHistory = async () => {
    if (!connectionId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('redis_uptime_history')
        .select('*')
        .eq('connection_id', connectionId)
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUptimeHistory(data || []);
    } catch (error) {
      console.error('Error fetching uptime history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Uptime History & Reboot Detection
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading uptime history...</span>
          </div>
        ) : uptimeHistory.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No uptime history available yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect to the server and wait for metrics to be collected
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">How Reboot Detection Works</h3>
              <p className="text-sm text-muted-foreground">
                Server reboots are detected when the current uptime is lower than the previous recorded uptime. 
                This indicates the server was restarted since the last measurement.
              </p>
            </div>

            <div className="space-y-2">
              {uptimeHistory.map((record, index) => (
                <div
                  key={record.id}
                  className={`p-4 rounded-lg border ${
                    record.server_rebooted 
                      ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {record.server_rebooted ? (
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      )}
                      <div>
                        <div className="font-medium">
                          {record.server_rebooted ? 'Server Reboot Detected' : 'Normal Operation'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Uptime: {formatUptime(record.uptime_seconds)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {format(new Date(record.recorded_at), 'MMM dd, HH:mm:ss')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(record.recorded_at), 'yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  {record.server_rebooted && (
                    <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-sm">
                      <strong>Reboot detected:</strong> Current uptime ({formatUptime(record.uptime_seconds)}) 
                      is lower than previous measurement
                      {index < uptimeHistory.length - 1 && (
                        <span> (was {formatUptime(uptimeHistory[index + 1].uptime_seconds)})</span>
                      )}
                      <div className="mt-1 text-xs">
                        <strong>Estimated reboot time:</strong> {new Date(Date.now() - (record.uptime_seconds * 1000)).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UptimeHistoryDialog;