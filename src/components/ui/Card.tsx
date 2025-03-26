import { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function Card({
  children,
  title,
  description,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
