import { useEffect, type FC } from "react";

interface SnackbarProps {
  message: string;
  open: boolean;
  onClose: () => void;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

const Snackbar: FC<SnackbarProps> = ({ message, open, onClose, duration = 4000, action }) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, onClose, duration]);

  if (!open) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-slide-up">
      <div className="flex items-center gap-3 bg-md-inverse-surface text-md-inverse-on-surface px-4 py-3 rounded-md-sm shadow-md-3">
        <p className="text-sm flex-1">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="text-md-inverse-primary text-sm font-medium px-2 py-1 rounded-md-sm hover:bg-white/[0.08] shrink-0"
          >
            {action.label}
          </button>
        )}
        <button
          onClick={onClose}
          className="text-md-inverse-on-surface/70 hover:text-md-inverse-on-surface p-1 shrink-0"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
