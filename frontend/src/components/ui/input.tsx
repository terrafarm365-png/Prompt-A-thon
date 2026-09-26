import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  compact?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, compact = false, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded border border-[#252A31] bg-[#111418] px-3 text-xs text-[#F5F7FA] placeholder:text-[#69717D] transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium focus-visible:outline-none focus-visible:border-[#4F7CFF] focus-visible:ring-1 focus-visible:ring-[#4F7CFF] disabled:cursor-not-allowed disabled:opacity-50",
          compact ? "h-8" : "h-9",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
