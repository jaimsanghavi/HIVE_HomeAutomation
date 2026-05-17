import { useState, useRef, type FC } from "react";
import Icon from "./Icon";

interface LightControlSheetProps {
  name: string;
  brightness: number;
  isOn: boolean;
  onBrightnessChange: (value: number) => void;
  onToggle: () => void;
}

const LightControlSheet: FC<LightControlSheetProps> = ({
  name,
  brightness,
  isOn,
  onBrightnessChange,
  onToggle,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  function calcBrightness(clientY: number) {
    if (!trackRef.current) return brightness;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = 1 - (clientY - rect.top) / rect.height;
    return Math.round(Math.max(0, Math.min(100, pct * 100)));
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (!isOn) return;
    setDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
    onBrightnessChange(calcBrightness(e.clientY));
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    onBrightnessChange(calcBrightness(e.clientY));
  }

  function handlePointerUp() {
    setDragging(false);
  }

  // Warm color gradient based on brightness
  const warmColor = isOn
    ? `rgba(251, 191, 36, ${0.15 + (brightness / 100) * 0.45})`
    : "rgba(107, 114, 128, 0.1)";

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Vertical slider track */}
      <div
        ref={trackRef}
        className={`relative w-28 rounded-[2rem] overflow-hidden touch-none select-none cursor-pointer
          transition-shadow duration-300
          ${isOn ? "shadow-[0_0_30px_rgba(251,191,36,0.2)]" : ""}`}
        style={{ height: 320 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 transition-colors" />

        {/* Fill level */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-[height] duration-150 ease-out"
          style={{
            height: isOn ? `${brightness}%` : "0%",
            background: isOn
              ? `linear-gradient(to top, #f59e0b, #fbbf24 40%, #fde68a)`
              : "transparent",
          }}
        />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-between py-6 px-3">
          {/* Name at top */}
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center leading-tight">
            {name}
          </p>

          {/* Brightness value */}
          <div className="flex flex-col items-center">
            <span className="text-4xl font-light text-gray-900 dark:text-gray-50 tabular-nums">
              {isOn ? brightness : 0}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 -mt-1">%</span>
          </div>

          {/* Power toggle button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
              min-w-[48px] min-h-[48px] active:scale-90
              ${
                isOn
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
              }`}
            aria-label={isOn ? "Turn off" : "Turn on"}
          >
            <Icon name="Power" size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LightControlSheet;
