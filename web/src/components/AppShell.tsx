import type { FC, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { t } from "../i18n";
import NavigationBar from "./NavigationBar";
import NavigationRail from "./NavigationRail";

const navItems = [
  { icon: "Home", label: t("nav.home"), path: "/" },
  { icon: "Home", label: t("nav.rooms"), path: "/rooms" },
  { icon: "Scene", label: t("nav.scenes"), path: "/scenes" },
  { icon: "Settings", label: t("nav.settings"), path: "/settings" },
];

interface AppShellProps {
  children: ReactNode;
  topBar?: ReactNode;
}

const AppShell: FC<AppShellProps> = ({ children, topBar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleNavigate = (path: string) => navigate(path);

  return (
    <div className="min-h-screen bg-md-surface">
      {/* Desktop rail */}
      <NavigationRail items={navItems} currentPath={location.pathname} onNavigate={handleNavigate} />

      <div className="md:ml-20">
        {topBar}
        <main className="pb-24 md:pb-6 px-4 md:px-6">{children}</main>
      </div>

      {/* Mobile bottom bar */}
      <NavigationBar items={navItems} currentPath={location.pathname} onNavigate={handleNavigate} />
    </div>
  );
};

export default AppShell;
