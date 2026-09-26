"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  className,
}: {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error("Trigger must be within DropdownMenu");

  return (
    <div
      onClick={() => context.setOpen(!context.open)}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </div>
  );
}

export function DropdownMenuContent({
  align = "right",
  className,
  children,
}: {
  align?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(DropdownContext);
  if (!context || !context.open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-1 min-w-[160px] rounded-md border border-[#252A31] bg-[#171A1F] p-1 text-[#F5F7FA] shadow-xl animate-in fade-in-80 duration-100",
        align === "right" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  onClick,
  className,
  destructive = false,
  children,
}: {
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  const context = React.useContext(DropdownContext);

  const handleClick = () => {
    onClick?.();
    context?.setOpen(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs transition-colors hover:bg-[#282A2D] text-left select-none",
        destructive
          ? "text-[#E05D6F] hover:bg-[#E05D6F]/10"
          : "text-[#9AA3AF] hover:text-[#F5F7FA]",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-[#252A31]" />;
}
