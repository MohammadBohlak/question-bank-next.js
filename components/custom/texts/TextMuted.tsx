import { cn } from "@/lib/utils";
import React from "react";
import { responsiveStyles } from "./commonStyles";
interface TextMutedProps {
  children: React.ReactNode;
  className?: string;
}
const TextMuted = ({ children, className }: TextMutedProps) => {
  return (
    <p
      className={cn(
        " flex items-center gap-2 text-gray-500 dark:text-gray-300",
        responsiveStyles,
        className,
      )}
    >
      {children}
    </p>
  );
};

export default TextMuted;
