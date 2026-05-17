import { useState, useRef, type FC } from "react";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  disabled?: boolean;
}

const Slider: FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  unit = "",
  disabled = false,
}) => {
  const [showLabel, setShowLabel] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full ${disabled ? "opacity-38 pointer-events-none" : ""}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-md-on-surface-variant">{label}</span>
          <span className="text-sm font-medium text-md-on-surface tabular-nums">{value}{unit}</span>
        </div>
      )}
      <div className="relative flex items-center h-11" ref={trackRef}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerDown={() => setShowLabel(true)}
          onPointerUp={() => setShowLabel(false)}
          onFocus={() => setShowLabel(true)}
          onBlur={() => setShowLabel(false)}
          className="slider-input absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={disabled}
        />
        {/* Track background */}
        <div className="absolute left-0 right-0 h-1 rounded-full bg-md-surface-variant">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-md-primary transition-[width] duration-100 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-md-primary shadow-md-1 transition-[left] duration-100 ease-linear pointer-events-none"
          style={{ left: `${pct}%` }}
        >
          {/* Value label */}
          {showLabel && (
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-md-primary text-md-on-primary text-xs font-medium px-2 py-1 rounded-md-sm whitespace-nowrap">
              {value}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Slider;
