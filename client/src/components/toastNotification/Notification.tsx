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
      className={`fixed top-20 left-0 right-0 z-[100] px-4 pointer-events-none`}
    >
      <div
        className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg max-w-md mx-auto pointer-events-auto`}
      >
        <p className="text-sm leading-relaxed break-words">{message}</p>
      </div>
    </div>
  ) : null;
}