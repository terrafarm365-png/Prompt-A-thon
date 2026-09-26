import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded font-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D10] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#4F7CFF] text-[#F5F7FA] hover:bg-[#3E6AE1] active:bg-[#3257BF] shadow-sm",
        secondary:
          "bg-[#171A1F] text-[#F5F7FA] border border-[#252A31] hover:bg-[#1E2229] hover:border-[#353B45]",
        outline:
          "border border-[#252A31] bg-transparent text-[#F5F7FA] hover:bg-[#171A1F] hover:text-[#FFFFFF]",
        ghost:
          "bg-transparent text-[#9AA3AF] hover:bg-[#171A1F] hover:text-[#F5F7FA]",
        destructive:
          "bg-transparent text-[#E05D6F] hover:bg-[#E05D6F]/10 border border-[#E05D6F]/30",
        destructiveSolid:
          "bg-[#E05D6F] text-[#FFFFFF] hover:bg-[#D04D5F]",
        link: "text-[#4F7CFF] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        sm: "h-7 rounded px-2 text-[11px]",
        lg: "h-9 rounded px-4 text-sm",
        icon: "h-8 w-8",
        iconSm: "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
