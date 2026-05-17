import { useEffect, useRef, type FC, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const BottomSheet: FC<BottomSheetProps> = ({ open, onClose, title, children }) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal
        aria-label={title}
        className="relative w-full sm:max-w-sm bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl
          shadow-2xl p-6 pt-3 animate-slideUp sm:animate-fadeIn"
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Close button (desktop) */}
        <button
          onClick={onClose}
          className="hidden sm:flex absolute top-4 right-4 w-8 h-8 rounded-full items-center justify-center
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors min-w-[44px] min-h-[44px]"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Title */}
        {title && (
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50 mb-4 pr-8">
            {title}
          </h3>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default BottomSheet;
