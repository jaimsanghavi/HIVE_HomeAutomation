import { useState, type FC, type ReactNode } from "react";
import Icon from "./Icon";

interface RoomSectionProps {
  name: string;
  deviceCount: number;
  activeCount: number;
  children: ReactNode;
  defaultOpen?: boolean;
}

const RoomSection: FC<RoomSectionProps> = ({
  name,
  deviceCount,
  activeCount,
  children,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full py-2 group"
      >
        <h3 className="text-base font-semibold text-md-on-surface">{name}</h3>
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-md-primary text-md-on-primary text-[10px] font-bold tabular-nums">
            {activeCount}
          </span>
        )}
        <span className="text-xs text-md-on-surface-variant ml-auto mr-1">
          {deviceCount} {deviceCount === 1 ? "device" : "devices"}
        </span>
        <Icon
          name="ChevronRight"
          size={16}
          className={`text-md-on-surface-variant transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && <div className="mt-1 mb-6">{children}</div>}
    </section>
  );
};

export default RoomSection;
