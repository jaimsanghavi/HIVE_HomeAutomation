import type { FC } from "react";
import Icon, { type IconName } from "./Icon";

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

interface NavigationBarProps {
  items: NavItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
}

const NavigationBar: FC<NavigationBarProps> = ({ items, currentPath, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-md-surface-container border-t border-md-outline-variant/30 safe-area-bottom md:hidden">
      <div className="flex items-center justify-around h-20">
        {items.map((item) => {
          const active = currentPath === item.path || (item.path !== "/" && currentPath.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className="flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[48px] px-3 py-2"
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
      </div>
    </nav>
  );
};

export default NavigationBar;
