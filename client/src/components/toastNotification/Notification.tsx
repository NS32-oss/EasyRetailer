import { useEffect, useState } from "react";

interface NotificationProps {
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

export function Notification({ message, type, duration = 3000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return isVisible ? (
    <div
      className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[100] transform transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div
        className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center max-w-md mx-auto sm:mx-0`}
      >
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  ) : null;
}