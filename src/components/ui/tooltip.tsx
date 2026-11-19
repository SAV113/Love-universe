import * as React from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  delayMs?: number;
}

const sideClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, content, side = "top", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("group/tooltip relative inline-flex", className)}
        {...props}
      >
        {children}
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 whitespace-nowrap rounded-md px-3 py-1.5 text-xs",
            "bg-[var(--popover)] text-[var(--popover-foreground)] border border-[var(--border)] shadow-md",
            "opacity-0 scale-95 transition-all duration-150",
            "group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100",
            sideClasses[side]
          )}
        >
          {content}
        </span>
      </div>
    );
  }
);
Tooltip.displayName = "Tooltip";

export { Tooltip };
