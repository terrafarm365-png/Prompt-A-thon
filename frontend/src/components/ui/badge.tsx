import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-[11px] font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30",
        secondary:
          "bg-[#282A2D] text-[#9AA3AF] border border-[#333538]",
        success:
          "bg-[#35C98B]/12 text-[#35C98B] border border-[#35C98B]/25",
        warning:
          "bg-[#E6B65C]/12 text-[#E6B65C] border border-[#E6B65C]/25",
        error:
          "bg-[#E05D6F]/12 text-[#E05D6F] border border-[#E05D6F]/25",
        info:
          "bg-[#5CA9FF]/12 text-[#5CA9FF] border border-[#5CA9FF]/25",
        outline:
          "border border-[#252A31] text-[#9AA3AF]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

function Badge({ className, variant, dot = false, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColor ||
              (variant === "success" && "bg-[#35C98B]") ||
              (variant === "warning" && "bg-[#E6B65C]") ||
              (variant === "error" && "bg-[#E05D6F]") ||
              (variant === "info" && "bg-[#5CA9FF]") ||
              (variant === "default" && "bg-[#4F7CFF]") ||
              "bg-[#9AA3AF]"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
