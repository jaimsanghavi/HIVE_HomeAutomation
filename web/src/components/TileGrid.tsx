import type { FC, ReactNode } from "react";

interface TileGridProps {
  children: ReactNode;
  className?: string;
}

const TileGrid: FC<TileGridProps> = ({ children, className = "" }) => (
  <div
    className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}
  >
    {children}
  </div>
);

export default TileGrid;
