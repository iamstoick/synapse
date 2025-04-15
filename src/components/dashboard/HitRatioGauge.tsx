
import { CacheLevel } from "@/types/redis";
import { 
  CircularProgressbarWithChildren, 
  buildStyles 
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface HitRatioGaugeProps {
  cacheLevel: CacheLevel;
}

const HitRatioGauge = ({ cacheLevel }: HitRatioGaugeProps) => {
  // Convert hit ratio to percentage
  const percentage = cacheLevel.hitRatio * 100;
  
  // Determine color based on hit ratio
  const getColor = (ratio: number) => {
    if (ratio >= 0.9) return "#10B981"; // Green for excellent
    if (ratio >= 0.8) return "#6366F1"; // Indigo for good
    if (ratio >= 0.7) return "#F59E0B"; // Amber for average
    return "#EF4444"; // Red for poor
  };
  
  const color = getColor(cacheLevel.hitRatio);
  
  return (
    <div className="w-full max-w-[150px] mx-auto">
      <CircularProgressbarWithChildren
        value={percentage}
        strokeWidth={10}
        styles={buildStyles({
          strokeLinecap: "round",
          pathColor: color,
          trailColor: "#E5E7EB",
        })}
      >
        <div className="text-center">
          <div className="text-2xl font-bold">{percentage.toFixed(0)}%</div>
          <div className="text-xs text-gray-500">Level {cacheLevel.level}</div>
        </div>
      </CircularProgressbarWithChildren>
      <div className="mt-2 text-center text-sm text-gray-600">
        <div>Hits: {cacheLevel.hits.toLocaleString()}</div>
        <div>Misses: {cacheLevel.misses.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default HitRatioGauge;
