import type { FC, ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: "filled" | "outlined" | "text";
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const Button: FC<ButtonProps> = ({
  variant = "filled",
  children,
  loading = false,
  fullWidth = false,
  disabled = false,
  className = "",
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const base =
    "relative min-h-[44px] px-6 rounded-md-xl font-medium text-sm tracking-wider inline-flex items-center justify-center gap-2 transition-all duration-200 ease-md-standard overflow-hidden select-none";

  const variants: Record<string, string> = {
    filled: `bg-md-primary text-md-on-primary
      hover:shadow-md-1
      active:shadow-none
      disabled:bg-md-on-surface/[0.12] disabled:text-md-on-surface/[0.38]`,
    outlined: `border border-md-outline text-md-primary bg-transparent
      hover:bg-md-primary/[0.08]
      active:bg-md-primary/[0.1]
      disabled:border-md-on-surface/[0.12] disabled:text-md-on-surface/[0.38]`,
    text: `text-md-primary bg-transparent
      hover:bg-md-primary/[0.08]
      active:bg-md-primary/[0.1]
      disabled:text-md-on-surface/[0.38]`,
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={isDisabled}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
        >
          <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
          <path d="M12 2a10 10 0 019.8 8" strokeOpacity={0.75} strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
