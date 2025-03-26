import { Outlet, Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  DocumentTextIcon,
  DocumentDuplicateIcon,
  PhotoIcon,
  UserCircleIcon,
  SwatchIcon,
  CodeBracketIcon,
  KeyIcon,
  DocumentIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const tools = [
  { name: "Case Converter", path: "/case-converter", icon: DocumentTextIcon },
  {
    name: "Text Formatter",
    path: "/text-formatter",
    icon: DocumentDuplicateIcon,
  },
  { name: "Lorem Generator", path: "/lorem-generator", icon: DocumentIcon },
  { name: "Image Resizer", path: "/image-resizer", icon: PhotoIcon },
  {
    name: "Letter Profile Image",
    path: "/letter-profile",
    icon: UserCircleIcon,
  },
  { name: "Color Converter", path: "/color-converter", icon: SwatchIcon },
  { name: "JSON Formatter", path: "/json-formatter", icon: CodeBracketIcon },
  { name: "UUID Generator", path: "/uuid-generator", icon: KeyIcon },
  {
    name: "Password Generator",
    path: "/password-generator",
    icon: ArrowPathIcon,
  },
];

export function DashboardLayout() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <h1 className="text-xl font-bold mb-6">Dev Tools</h1>
            <nav className="space-y-1">
              {tools.map((tool) => {
                const isActive = location.pathname === tool.path;
                return (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <tool.icon className="w-5 h-5 mr-3" />
                    {tool.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {tools.find((tool) => tool.path === location.pathname)?.name ||
                  "Dev Tools"}
              </h2>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {theme === "dark" ? "🌞" : "🌙"}
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
