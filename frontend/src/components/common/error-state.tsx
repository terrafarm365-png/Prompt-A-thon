import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Telemetry Unavailable",
  description = "An error occurred while attempting to query the cluster state or partition lease.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-md border border-[#E05D6F]/30 bg-[#E05D6F]/5",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-[#E05D6F]/10 border border-[#E05D6F]/20 flex items-center justify-center text-[#E05D6F] mb-3">
        <AlertTriangle className="w-5 h-5 text-[#E05D6F]" />
      </div>
      <h3 className="text-sm font-semibold text-[#F5F7FA] mb-1">{title}</h3>
      <p className="text-xs text-[#9AA3AF] max-w-sm mb-4">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-1.5 border-[#E05D6F]/30 text-[#F5F7FA]">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </Button>
      )}
    </div>
  );
}
