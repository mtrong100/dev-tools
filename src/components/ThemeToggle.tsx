import { useTheme } from "../context/ThemeContext";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-lg ${
          theme === "light"
            ? "bg-gray-200 dark:bg-gray-700"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <SunIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-lg ${
          theme === "dark"
            ? "bg-gray-200 dark:bg-gray-700"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <MoonIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-lg ${
          theme === "system"
            ? "bg-gray-200 dark:bg-gray-700"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <ComputerDesktopIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
