"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { VaultLogo } from "./vault-logo";
import {
  Folder,
  Clock,
  Star,
  Trash2,
  Database,
  Server,
  Activity,
  Wrench,
  FileText,
  Settings,
  ChevronsUpDown,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  onCloseMobile?: () => void;
}

export function AppSidebar({ onCloseMobile }: AppSidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const navGroups = [
    {
      title: "OVERVIEW",
      links: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/files", label: "Files", icon: Folder },
        { href: "/files?filter=recent", label: "Recent", icon: Clock },
        { href: "/files?filter=starred", label: "Starred", icon: Star },
        { href: "/files?filter=trash", label: "Trash", icon: Trash2 },
      ],
    },
    {
      title: "STORAGE",
      links: [
        { href: "/storage", label: "Storage Overview", icon: Database },
        { href: "/nodes", label: "Nodes", icon: Server },
        { href: "/health", label: "System Health", icon: Activity },
        { href: "/repairs", label: "Repairs", icon: Wrench },
      ],
    },
    {
      title: "SYSTEM",
      links: [
        { href: "/activity", label: "Activity", icon: FileText },
        { href: "/settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="h-full w-64 bg-[#0C0E11] border-r border-[#252A31] flex flex-col justify-between select-none">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Top Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#252A31] shrink-0">
          <VaultLogo showText={true} versionBadge="v2.4-prod" href="/dashboard" />
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.title}>
              <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#69717D]">
                {group.title}
              </span>
              <div className="mt-1.5 space-y-0.5">
                {group.links.map((link) => {
                  const Icon = link.icon;
                  const active = isLinkActive(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors",
                        active
                          ? "bg-[#282A2D] text-[#4F7CFF] font-medium"
                          : "text-[#9AA3AF] hover:bg-[#1A1C1F] hover:text-[#F5F7FA]"
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-[#8D90A0]" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User profile footer */}
      <div className="p-3 border-t border-[#252A31] shrink-0">
        <Link
          href="/settings"
          className="flex items-center justify-between p-2 rounded-md hover:bg-[#1A1C1F] transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#1E2023] border border-[#252A31] flex items-center justify-center text-xs font-semibold text-[#4F7CFF] shrink-0">
              RK
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#F5F7FA] truncate">Rohit Kumar</p>
              <p className="text-[10px] font-mono text-[#69717D] truncate">Personal Workspace</p>
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-[#69717D] group-hover:text-[#9AA3AF] shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
