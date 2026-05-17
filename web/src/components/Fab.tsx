import type { FC, ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

interface FabProps {
  icon: IconName;
  label?: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "tertiary";
}

const Fab: FC<FabProps> = ({ icon, label, onClick, variant = "primary" }) => {
  const colors: Record<string, string> = {
    primary: "bg-md-primary-container text-md-on-primary-container",
    secondary: "bg-md-secondary-container text-md-on-secondary-container",
    tertiary: "bg-md-tertiary-container text-md-on-tertiary-container",
  };

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-24 md:bottom-8 right-6 z-40 flex items-center gap-2 rounded-md-lg shadow-md-3 hover:shadow-md-4 active:shadow-md-2 transition-all duration-200 ease-md-standard ${colors[variant]} ${
        label ? "px-4 h-14" : "w-14 h-14 justify-center"
      }`}
    >
      <Icon name={icon} size={24} />
      {label && <span className="font-medium text-sm">{label}</span>}
    </button>
  );
};

export default Fab;
