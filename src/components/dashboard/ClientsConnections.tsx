
import { RedisPerformanceMetrics } from "@/types/redis";
import { Users, UserPlus, UserX } from "lucide-react";
import MetricCard from "./MetricCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ClientsConnectionsProps {
  metrics: RedisPerformanceMetrics;
}

const ClientsConnections = ({ metrics }: ClientsConnectionsProps) => {
  const clients = metrics.clients || {
    connectedClients: metrics.connectedClients || 0,
    totalConnectionsReceived: 0,
    rejectedConnections: 0,
    maxClients: 0
  };

  const connectionUtilization = clients.maxClients > 0 
    ? (clients.connectedClients / clients.maxClients * 100)
    : 0;

  const getUtilizationStatus = (utilization: number) => {
    if (utilization > 80) return { color: "text-red-600", status: "Critical" };
    if (utilization > 60) return { color: "text-orange-600", status: "High" };
    if (utilization > 40) return { color: "text-yellow-600", status: "Medium" };
    return { color: "text-green-600", status: "Good" };
  };

  const utilizationStatus = getUtilizationStatus(connectionUtilization);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Clients & Connections</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Connection management and client metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricCard
                  title="Connected Clients"
                  value={clients.connectedClients.toLocaleString()}
                  icon={<Users className="w-5 h-5" />}
                  trend={connectionUtilization > 60 ? "up" : "neutral"}
                  trendValue={`${connectionUtilization.toFixed(1)}%`}
                  className="border-l-4 border-l-blue-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Number of currently active client connections to Redis. Each connection consumes memory and resources. Monitor for connection leaks or unexpected spikes.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricCard
                  title="Total Connections"
                  value={clients.totalConnectionsReceived.toLocaleString()}
                  icon={<UserPlus className="w-5 h-5" />}
                  trend="neutral"
                  className="border-l-4 border-l-green-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total number of connections received since Redis startup. This includes both successful and rejected connections. Useful for monitoring traffic patterns over time.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MetricCard
                  title="Rejected Connections"
                  value={clients.rejectedConnections.toLocaleString()}
                  icon={<UserX className="w-5 h-5" />}
                  trend={clients.rejectedConnections > 0 ? "up" : "neutral"}
                  className="border-l-4 border-l-red-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Number of connections rejected due to reaching the maxclients limit. Non-zero values indicate that clients are being denied access and maxclients should be increased.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Connection Status</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Current Clients:</span>
              <span>{clients.connectedClients.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Max Clients:</span>
              <span>{clients.maxClients.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Utilization:</span>
              <span className={utilizationStatus.color}>
                {connectionUtilization.toFixed(1)}% ({utilizationStatus.status})
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Connection Activity</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Total Received:</span>
              <span>{clients.totalConnectionsReceived.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Rejected:</span>
              <span className={clients.rejectedConnections > 0 ? "text-red-600" : ""}>
                {clients.rejectedConnections.toLocaleString()}
              </span>
            </div>
            {clients.rejectedConnections > 0 && (
              <div className="text-red-600 dark:text-red-400 text-xs mt-2">
                ⚠ Connections being rejected - consider increasing max_clients
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsConnections;
