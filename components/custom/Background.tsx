import { cn } from "@/lib/utils";
import React from "react";
interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
}
function Background({ children, className }: BackgroundProps) {
  return (
    <div
      className={cn(
        `mb-8 bg-white dark:bg-gray-800 p-5 shadow-lg rounded-lg flex items-center`,
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Background;
