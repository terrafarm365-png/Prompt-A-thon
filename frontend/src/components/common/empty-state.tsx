import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-md border border-dashed border-[#252A31] bg-[#111418]/50",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-[#171A1F] border border-[#252A31] flex items-center justify-center text-[#9AA3AF] mb-3">
        <Icon className="w-5 h-5 text-[#9AA3AF]" />
      </div>
      <h3 className="text-sm font-semibold text-[#F5F7FA] mb-1">{title}</h3>
      <p className="text-xs text-[#9AA3AF] max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
