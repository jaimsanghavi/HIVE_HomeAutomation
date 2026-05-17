import { useEffect, useRef, type FC, type ReactNode } from "react";
import Icon from "./Icon";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

const Dialog: FC<DialogProps> = ({ open, onClose, title, children, actions }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="backdrop:bg-md-scrim/[0.32] bg-md-surface-container-high text-md-on-surface rounded-md-xl p-0 max-w-md w-[calc(100%-32px)] shadow-md-3 animate-dialog-open"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 -m-1 rounded-full hover:bg-md-on-surface/[0.08] min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <Icon name="Plus" size={20} className="rotate-45" />
          </button>
        </div>
        <div className="text-sm text-md-on-surface-variant">{children}</div>
        {actions && (
          <div className="flex justify-end gap-2 mt-6">{actions}</div>
        )}
      </div>
    </dialog>
  );
};

export default Dialog;
