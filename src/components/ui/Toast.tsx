import { useEffect } from "react";
import { cn } from "../../lib/utils";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white transform transition-all duration-300 ease-in-out",
        type === "success" ? "bg-green-500" : "bg-red-500"
      )}
    >
      {message}
    </div>
  );
}
