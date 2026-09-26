"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  side?: "right" | "left";
  className?: string;
  children: React.ReactNode;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  side = "right",
  className,
  children,
}: DrawerProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B0D10]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed inset-y-0 z-50 flex max-w-full",
          side === "right" ? "right-0 pl-10" : "left-0 pr-10"
        )}
      >
        <div
          className={cn(
            "w-screen max-w-md bg-[#171A1F] border-l border-[#252A31] shadow-2xl flex flex-col text-[#F5F7FA]",
            side === "left" && "border-r border-l-0",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#252A31] bg-[#111418]">
            <div>
              {title && <h3 className="text-sm font-semibold text-[#F5F7FA]">{title}</h3>}
              {subtitle && <p className="text-[11px] text-[#9AA3AF]">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-[#9AA3AF] hover:text-[#F5F7FA] hover:bg-[#282A2D] transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
