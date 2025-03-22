import { useState } from "react";

interface ChartTabProps {
  onSelect: (option: "Daily" | "Monthly" | "Yearly") => void;
}

const ChartTab: React.FC<ChartTabProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<"Daily" | "Monthly" | "Yearly">(
    "Daily"
  );

  const getButtonClass = (option: "Daily" | "Monthly" | "Yearly") =>
    selected === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  const handleSelect = (option: "Daily" | "Monthly" | "Yearly") => {
    setSelected(option);
    onSelect(option);
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      <button
        onClick={() => handleSelect("Daily")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "Daily"
        )}`}
      >
        Daily
      </button>

      <button
        onClick={() => handleSelect("Monthly")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "Monthly"
        )}`}
      >
        Monthly
      </button>

      <button
        onClick={() => handleSelect("Yearly")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "Yearly"
        )}`}
      >
        Yearly
      </button>
    </div>
  );
};

export default ChartTab;
