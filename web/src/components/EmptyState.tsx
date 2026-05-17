import type { FC, ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState: FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center gap-4 py-16 px-6">
    <div className="w-16 h-16 rounded-full bg-md-surface-variant flex items-center justify-center">
      <Icon name={icon} size={32} className="text-md-on-surface-variant" />
    </div>
    <div className="text-center space-y-1">
      <h3 className="text-lg font-medium text-md-on-surface">{title}</h3>
      {description && (
        <p className="text-sm text-md-on-surface-variant max-w-xs">{description}</p>
      )}
    </div>
    {action}
  </div>
);

export default EmptyState;
