import type React from "react";


interface BrandProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const iconSizeMap: Record<NonNullable<BrandProps["size"]>, number> = {
  sm: 28,
  md: 36,
  lg: 44,
};

// Simple, self-contained brand mark that works on light and dark backgrounds.
const Brand: React.FC<BrandProps> = ({ variant = "full", size = "md", className }) => {
  const dimension = iconSizeMap[size];

  return (
    <div
      className={`inline-flex items-center gap-2 select-none ${className ? className : ""}`}
      aria-label="EasyRetailer"
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden
      >
        <defs>
          <linearGradient id="brandGradient" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="brandAccent" x1="18" y1="20" x2="44" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e0f2fe" stopOpacity="0.85" />
            <stop offset="1" stopColor="#c7d2fe" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="48" height="48" rx="16" fill="url(#brandGradient)" />
        <path
          d="M20 16h18c5.523 0 10 4.477 10 10 0 5.153-3.92 9.417-8.99 9.95L34 36h-6v10h-8V16Z"
          fill="url(#brandAccent)"
          opacity="0.95"
        />
        <path
          d="M29.5 22H36c3.866 0 7 3.134 7 7v15h-8V32a3 3 0 0 0-3-3h-3l-4.9 11H18l6.7-15.3A4 4 0 0 1 29.5 22Z"
          fill="white"
        />
        <path d="M20 44h22v4H20z" fill="white" opacity="0.9" />
      </svg>

      {variant === "full" && (
        <div className="leading-tight">
          <span className="block text-base font-semibold text-gray-900 dark:text-white">
            EasyRetailer
          </span>
          <span className="block text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            Retail OS
          </span>
        </div>
      )}
    </div>
  );
};

export default Brand;
