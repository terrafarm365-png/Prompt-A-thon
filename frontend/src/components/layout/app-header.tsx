"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HardDrive,
  Search,
  Bell,
  HelpCircle,
  Plus,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadDialog } from "@/components/files/upload-dialog";
import { Drawer } from "@/components/ui/drawer";
import { AppSidebar } from "./app-sidebar";

interface AppHeaderProps {
  clusterName?: string;
  onUploadSuccess?: () => void;
}

export function AppHeader({
  clusterName = "US-East Cluster",
  onUploadSuccess,
}: AppHeaderProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <header className="sticky top-0 z-40 h-14 bg-[#0C0E11]/90 backdrop-blur-md border-b border-[#252A31] px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile trigger & Cluster breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded text-[#9AA3AF] hover:text-[#F5F7FA] hover:bg-[#1A1C1F]"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs">
            <HardDrive className="w-4 h-4 text-[#8D90A0]" />
            <span className="font-mono text-[#69717D]">/</span>
            <span className="font-medium text-[#F5F7FA] truncate">{clusterName}</span>
          </div>
        </div>

        {/* Right: Search, Node Health Pill, Notifications, Docs, Upload CTA */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative hidden md:flex items-center w-64 lg:w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-[#69717D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files, objects, nodes..."
              className="w-full h-8 pl-8 pr-12 rounded bg-[#0C0E11] border border-[#252A31] text-xs text-[#F5F7FA] placeholder:text-[#69717D] focus:outline-none focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF]"
            />
            <kbd className="absolute right-2 px-1 py-0.5 rounded bg-[#171A1F] text-[#69717D] font-mono text-[10px] border border-[#252A31]">
              ⌘K
            </kbd>
          </div>

          {/* Node Health Pill */}
          <Link
            href="/nodes"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1A1C1F] border border-[#252A31] hover:border-[#353B45] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#35C98B] animate-pulse" />
            <span className="font-mono text-[11px] text-[#9AA3AF]">
              Healthy: 6/6 Nodes
            </span>
          </Link>

          {/* Notification Icon */}
          <Link
            href="/activity"
            className="p-1.5 rounded hover:bg-[#171A1F] text-[#9AA3AF] hover:text-[#F5F7FA] transition-colors"
            title="Activity Notifications"
          >
            <Bell className="w-4 h-4" />
          </Link>

          {/* Docs Link */}
          <Link
            href="/docs"
            className="hidden sm:flex items-center gap-1 text-xs text-[#9AA3AF] hover:text-[#F5F7FA] transition-colors py-1 px-1.5 rounded hover:bg-[#171A1F]"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Docs</span>
          </Link>

          {/* Upload Button */}
          <Button
            size="sm"
            onClick={() => setUploadOpen(true)}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload</span>
          </Button>
        </div>
      </header>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploadComplete={onUploadSuccess}
      />

      {/* Mobile Sidebar Drawer */}
      <Drawer
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        side="left"
        className="w-64 p-0"
      >
        <AppSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
      </Drawer>
    </>
  );
}
