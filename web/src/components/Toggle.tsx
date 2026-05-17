import type { FC } from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

const Toggle: FC<ToggleProps> = ({ checked, onChange, disabled = false, size = "md" }) => {
  const dims = size === "sm" ? { track: "w-10 h-6", thumb: "w-4 h-4", translate: "translate-x-4" } : { track: "w-14 h-8", thumb: "w-6 h-6", translate: "translate-x-6" };

  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex items-center shrink-0 rounded-full
        transition-colors duration-200 ease-md-standard
        min-w-[44px] min-h-[44px] p-1
        ${dims.track}
        ${checked ? "bg-md-primary" : "bg-md-surface-variant"}
        ${disabled ? "opacity-38 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span
        className={`
          inline-block rounded-full shadow-sm
          transition-transform duration-200 ease-md-standard
          ${dims.thumb}
          ${checked ? `${dims.translate} bg-md-on-primary` : "translate-x-0 bg-md-outline"}
        `}
      />
    </button>
  );
};

export default Toggle;
