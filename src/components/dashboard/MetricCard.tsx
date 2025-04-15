
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

const MetricCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  className,
}: MetricCardProps) => {
  return (
    <div className={cn(
      "bg-card p-4 rounded-lg shadow-sm border border-border",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-semibold">{value}</p>
            {trendValue && trend && (
              <span className={cn(
                "ml-2 text-xs font-medium",
                trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"
              )}>
                {trend === "up" ? "↑" : trend === "down" ? "↓" : ""}
                {trendValue}
              </span>
            )}
          </div>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
