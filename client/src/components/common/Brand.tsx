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
          <linearGradient id="brandGradient" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="52" height="52" rx="14" fill="url(#brandGradient)" />
        <path
          d="M20 18h16c5.523 0 10 4.477 10 10s-4.477 10-10 10H28v8h-8V18Zm8 6v8h8a4 4 0 0 0 0-8h-8Z"
          fill="white"
        />
        <path
          d="M34 28h4c3.866 0 7 3.134 7 7v11h-8V36a2 2 0 0 0-2-2h-1l-5.5 12H20l7.5-18H34Z"
          fill="white"
          opacity="0.92"
        />
      </svg>

      {variant === "full" && (
        <div className="leading-tight">
          <span className="block text-base font-semibold text-gray-900 dark:text-white">
            EasyRetailer
          </span>
          <span className="block text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            Inventory Suite
          </span>
        </div>
      )}
    </div>
  );
};

export default Brand;
