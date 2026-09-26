import React from "react";
import {
  FileArchive,
  FileCode,
  FileSpreadsheet,
  File,
  Cpu,
  Database,
  Image as ImageIcon,
  Video,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTypeIconProps {
  type: string;
  className?: string;
  name?: string;
}

export function FileTypeIcon({ type, className, name = "" }: FileTypeIconProps) {
  const lowerType = (type || "").toLowerCase();
  const lowerName = (name || "").toLowerCase();

  const iconClasses = cn("w-4 h-4 shrink-0", className);

  if (
    lowerType.includes("zip") ||
    lowerType.includes("archive") ||
    lowerType.includes("tar") ||
    lowerType.includes("gz") ||
    lowerName.endsWith(".zip") ||
    lowerName.endsWith(".tar.gz")
  ) {
    return <FileArchive className={cn(iconClasses, "text-[#4F7CFF]")} />;
  }

  if (
    lowerType.includes("model") ||
    lowerType.includes("checkpoint") ||
    lowerName.endsWith(".safetensors") ||
    lowerName.endsWith(".onnx")
  ) {
    return <Cpu className={cn(iconClasses, "text-[#E6B65C]")} />;
  }

  if (
    lowerType.includes("parquet") ||
    lowerType.includes("dataset") ||
    lowerType.includes("csv") ||
    lowerName.endsWith(".parquet") ||
    lowerName.endsWith(".csv")
  ) {
    return <FileSpreadsheet className={cn(iconClasses, "text-[#5CA9FF]")} />;
  }

  if (
    lowerType.includes("sql") ||
    lowerType.includes("database") ||
    lowerName.endsWith(".sql") ||
    lowerName.endsWith(".sql.gz")
  ) {
    return <Database className={cn(iconClasses, "text-[#35C98B]")} />;
  }

  if (
    lowerType.includes("yaml") ||
    lowerType.includes("config") ||
    lowerType.includes("json") ||
    lowerName.endsWith(".yaml") ||
    lowerName.endsWith(".yml") ||
    lowerName.endsWith(".json")
  ) {
    return <FileCode className={cn(iconClasses, "text-[#9AA3AF]")} />;
  }

  if (lowerType.includes("image")) {
    return <ImageIcon className={cn(iconClasses, "text-[#9AA3AF]")} />;
  }

  if (lowerType.includes("video")) {
    return <Video className={cn(iconClasses, "text-[#9AA3AF]")} />;
  }

  if (lowerType.includes("audio")) {
    return <Music className={cn(iconClasses, "text-[#9AA3AF]")} />;
  }

  return <File className={cn(iconClasses, "text-[#9AA3AF]")} />;
}
