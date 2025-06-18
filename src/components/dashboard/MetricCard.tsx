
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
      "bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:scale-[1.02]",
      className
    )}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            {trendValue && trend && (
              <span className={cn(
                "ml-3 text-sm font-medium flex items-center",
                trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"
              )}>
                {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}
                <span className="ml-1">{trendValue}</span>
              </span>
            )}
          </div>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
