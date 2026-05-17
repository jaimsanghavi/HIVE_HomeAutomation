import type { FC } from "react";
import Icon, { type IconName } from "./Icon";

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

interface NavigationRailProps {
  items: NavItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
}

const NavigationRail: FC<NavigationRailProps> = ({ items, currentPath, onNavigate }) => {
  return (
    <nav className="hidden md:flex flex-col items-center w-20 min-h-screen bg-md-surface-container py-7 gap-3 fixed left-0 top-0 z-30">
      {/* Brand mark */}
      <div className="mb-6 text-md-primary font-bold text-lg">H</div>
      {items.map((item) => {
        const active = currentPath === item.path || (item.path !== "/" && currentPath.startsWith(item.path));
        return (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className="flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[48px] px-2 py-1"
          >
            <div className="relative flex items-center justify-center">
              {active && (
                <div className="absolute inset-x-[-12px] inset-y-[-4px] bg-md-secondary-container rounded-full" />
              )}
              <Icon name={item.icon as IconName} size={24} className={`relative z-10 ${active ? "text-md-on-secondary-container" : "text-md-on-surface-variant"}`} />
            </div>
            <span className={`text-xs font-medium ${active ? "text-md-on-surface" : "text-md-on-surface-variant"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default NavigationRail;
