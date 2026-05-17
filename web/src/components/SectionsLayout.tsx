import type { FC, ReactNode } from "react";

interface SectionProps {
  title?: string;
  span?: 1 | 2 | "full";
  children: ReactNode;
}

/** A grid section that can span 1 column, 2 columns, or full width */
const Section: FC<SectionProps> = ({ title, span = "full", children }) => {
  const spanClass =
    span === "full"
      ? "col-span-full"
      : span === 2
        ? "col-span-full sm:col-span-2"
        : "col-span-1";

  return (
    <div className={spanClass}>
      {title && (
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

interface SectionsLayoutProps {
  children: ReactNode;
}

/** CSS grid layout supporting mixed-size widget sections */
const SectionsLayout: FC<SectionsLayoutProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {children}
    </div>
  );
};

export { Section };
export default SectionsLayout;
