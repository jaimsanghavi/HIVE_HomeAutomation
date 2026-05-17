import type { FC, ReactNode } from "react";

interface CardProps {
  variant?: "elevated" | "filled" | "outlined";
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  padding?: boolean;
}

const Card: FC<CardProps> = ({
  variant = "filled",
  children,
  onClick,
  className = "",
  padding = true,
}) => {
  const base = `rounded-md-lg transition-all duration-200 ease-md-standard ${
    padding ? "p-4" : ""
  }`;

  const variants: Record<string, string> = {
    elevated: "bg-md-surface-container-low shadow-md-1",
    filled: "bg-md-surface-container-high",
    outlined: "bg-md-surface border border-md-outline-variant",
  };

  const interactive = onClick
    ? "cursor-pointer hover:shadow-md-2 hover:-translate-y-0.5 active:shadow-md-1 active:translate-y-0 min-h-[44px]"
    : "";

  return (
    <div
      className={`${base} ${variants[variant]} ${interactive} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
