import { cn } from "@/lib/utils";
import React from "react";
interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
}
function Background({ children, className, isHeader }: BackgroundProps) {
  return (
    <div
      className={cn(
        `mb-8 bg-white dark:bg-gray-800 p-5 rounded-lg flex items-center`,
        className,
        isHeader ? "shadow-lg" : "",
      )}
    >
      {children}
    </div>
  );
}

export default Background;
