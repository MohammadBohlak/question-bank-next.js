import React from "react";
import { cn } from "@/lib/utils";
import { responsiveStyles } from "./commonStyles";

interface MainTitleProps {
  children: React.ReactNode;
  className?: string;
}
const MainTitle = ({ children, className }: MainTitleProps) => {
  return (
    <h1
      className={cn(
        "text-2xl sm:text-3xl font-bold tracking-tight text-prim dark:text-sec",
        responsiveStyles,
        className,
      )}
    >
      {children}
    </h1>
  );
};

export default MainTitle;
