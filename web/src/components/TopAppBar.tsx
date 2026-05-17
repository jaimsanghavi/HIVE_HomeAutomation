import type { FC, ReactNode } from "react";

interface TopAppBarProps {
  title: string;
  navigationIcon?: ReactNode;
  actions?: ReactNode[];
  variant?: "small" | "medium";
}

const TopAppBar: FC<TopAppBarProps> = ({
  title,
  navigationIcon,
  actions = [],
  variant = "small",
}) => {
  return (
    <header className="sticky top-0 z-30 bg-md-surface/95 backdrop-blur-sm">
      <div
        className={`flex items-center gap-1 px-1 ${
          variant === "medium" ? "flex-wrap" : ""
        }`}
      >
        {/* Nav icon */}
        {navigationIcon && (
          <div className="min-w-[48px] min-h-[48px] flex items-center justify-center">
            {navigationIcon}
          </div>
        )}

        {variant === "small" && (
          <h1 className="flex-1 text-[22px] leading-7 font-normal text-md-on-surface truncate px-1">
            {title}
          </h1>
        )}

        {/* Actions */}
        <div className="flex items-center ml-auto">
          {actions.map((action, i) => (
            <div key={i} className="min-w-[48px] min-h-[48px] flex items-center justify-center">
              {action}
            </div>
          ))}
        </div>
      </div>

      {variant === "medium" && (
        <div className="px-4 pb-6 pt-2">
          <h1 className="text-[28px] leading-9 font-normal text-md-on-surface">{title}</h1>
        </div>
      )}
    </header>
  );
};

export default TopAppBar;
