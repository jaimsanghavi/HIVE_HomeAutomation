import type { FC } from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

const Skeleton: FC<SkeletonProps> = ({
  className = "",
  variant = "text",
  width,
  height,
}) => {
  const base = "animate-pulse bg-md-on-surface/[0.08] shrink-0";

  const variants: Record<string, string> = {
    text: "rounded-md-xs h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-md-sm",
  };

  return (
    <div
      className={`${base} ${variants[variant]} ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
};

/** Pre-built card skeleton matching DeviceCard layout */
export const DeviceCardSkeleton: FC = () => (
  <div className="bg-md-surface-container-high rounded-md-lg p-4">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton width="70%" height={14} />
        <Skeleton width="40%" height={10} />
      </div>
      <Skeleton variant="rectangular" width={40} height={24} className="rounded-full" />
    </div>
  </div>
);

/** Pre-built room card skeleton */
export const RoomCardSkeleton: FC = () => (
  <div className="bg-md-surface-container-high rounded-md-lg p-4">
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={10} />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
    </div>
  </div>
);

export default Skeleton;
