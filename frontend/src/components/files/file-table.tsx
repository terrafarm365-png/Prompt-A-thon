"use client";

import React, { useState } from "react";
import { VaultObject } from "@/types";
import { FileTypeIcon } from "./file-type-icon";
import { ObjectStatusBadge } from "@/components/ui/status-indicator";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Download,
  Info,
  Trash2,
  Share2,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { FileDetailsDrawer } from "./file-details-drawer";

interface FileTableProps {
  objects: VaultObject[];
  onDelete?: (id: string) => void;
}

export function FileTable({ objects, onDelete }: FileTableProps) {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"name" | "size" | "updatedAt">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const selectedObject = objects.find((o) => o.id === selectedObjectId) || null;

  // Filter & sort
  const filteredObjects = objects
    .filter((obj) => {
      const matchesSearch =
        obj.name.toLowerCase().includes(search.toLowerCase()) ||
        obj.type.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true : obj.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortField === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortField === "size") {
        return sortOrder === "asc" ? a.size - b.size : b.size - a.size;
      }
      if (sortField === "updatedAt") {
        return sortOrder === "asc"
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return 0;
    });

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRows(next);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredObjects.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredObjects.map((o) => o.id)));
    }
  };

  const handleRowClick = (obj: VaultObject) => {
    setSelectedObjectId(obj.id);
    setDrawerOpen(true);
  };

  const handleSort = (field: "name" | "size" | "updatedAt") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleDelete = (id: string, name: string) => {
    onDelete?.(id);
    toast.success(`Object ${name} removed from cluster allocation`);
  };

  return (
    <div className="space-y-3">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111418] p-3 rounded-lg border border-[#252A31]">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#69717D]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter objects by filename or format..."
              compact
              className="pl-8 bg-[#0C0E11]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#9AA3AF]">
            <Filter className="w-3.5 h-3.5 text-[#69717D]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by integrity status"
              className="h-8 rounded border border-[#252A31] bg-[#0C0E11] px-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#4F7CFF]"
            >
              <option value="all">All States</option>
              <option value="healthy">Healthy Only</option>
              <option value="repairing">Repairing</option>
              <option value="degraded">Degraded</option>
            </select>
          </div>

          {selectedRows.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                toast.success(`${selectedRows.size} objects marked for erasure`);
                setSelectedRows(new Set());
              }}
              className="gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedRows.size})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-lg border border-[#252A31] bg-[#111418]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="h-9 border-b border-[#252A31] bg-[#0C0E11] text-[#69717D] uppercase font-semibold text-[10px] tracking-wider select-none">
              <th className="w-10 px-3 text-center">
                <input
                  type="checkbox"
                  checked={
                    filteredObjects.length > 0 &&
                    selectedRows.size === filteredObjects.length
                  }
                  onChange={toggleSelectAll}
                  aria-label="Select all objects"
                  className="w-3.5 h-3.5 rounded bg-[#171A1F] border-[#252A31] accent-[#4F7CFF] cursor-pointer"
                />
              </th>
              <th
                onClick={() => handleSort("name")}
                className="px-3 py-2 cursor-pointer hover:text-[#F5F7FA]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Object Name</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-3 py-2 hidden md:table-cell">Type</th>
              <th
                onClick={() => handleSort("size")}
                className="px-3 py-2 text-right cursor-pointer hover:text-[#F5F7FA]"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Logical Size</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-3 py-2 text-right hidden sm:table-cell">
                Physical Footprint
              </th>
              <th
                onClick={() => handleSort("updatedAt")}
                className="px-3 py-2 hidden lg:table-cell cursor-pointer hover:text-[#F5F7FA]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Modified</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-3 py-2">Integrity</th>
              <th className="px-3 py-2 text-center w-12">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2229]">
            {filteredObjects.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#9AA3AF]">
                  No matching distributed objects found.
                </td>
              </tr>
            ) : (
              filteredObjects.map((obj) => {
                const isSelected = selectedRows.has(obj.id);
                const isCurrentActive = selectedObjectId === obj.id && drawerOpen;

                return (
                  <tr
                    key={obj.id}
                    onClick={() => handleRowClick(obj)}
                    className={`h-11 transition-colors cursor-pointer group select-none ${
                      isCurrentActive
                        ? "bg-[#4F7CFF]/15"
                        : isSelected
                        ? "bg-[#171A1F]"
                        : "hover:bg-[#14171D]"
                    }`}
                  >
                    <td
                      className="w-10 px-3 text-center"
                      onClick={(e) => toggleSelectRow(obj.id, e)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        aria-label={`Select object ${obj.name}`}
                        className="w-3.5 h-3.5 rounded bg-[#171A1F] border-[#252A31] accent-[#4F7CFF] cursor-pointer"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileTypeIcon type={obj.type} name={obj.name} className="w-4 h-4 shrink-0" />
                        <span className="font-medium text-[#F5F7FA] group-hover:text-[#4F7CFF] transition-colors truncate max-w-[200px] sm:max-w-xs">
                          {obj.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#282A2D] text-[#9AA3AF] font-mono text-[10px] hidden sm:inline">
                          v{obj.version}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-2 text-[#9AA3AF] hidden md:table-cell">
                      {obj.type}
                    </td>

                    <td className="px-3 py-2 text-right font-mono text-[#F5F7FA]">
                      {formatBytes(obj.size)}
                    </td>

                    <td className="px-3 py-2 text-right font-mono text-[#69717D] hidden sm:table-cell">
                      {formatBytes(obj.physicalSize)}
                    </td>

                    <td className="px-3 py-2 text-[#9AA3AF] hidden lg:table-cell">
                      {formatRelativeTime(obj.updatedAt)}
                    </td>

                    <td className="px-3 py-2">
                      <ObjectStatusBadge status={obj.status} scheme="4+2" />
                    </td>

                    <td
                      className="px-3 py-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-[#282A2D] text-[#9AA3AF] hover:text-[#F5F7FA] transition-colors"
                            aria-label={`Actions for ${obj.name}`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="right">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedObjectId(obj.id);
                              setDrawerOpen(true);
                            }}
                          >
                            <Info className="w-3.5 h-3.5 text-[#4F7CFF]" />
                            <span>View Shard Topology</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast.info(`Downloading shards for ${obj.name}...`)
                            }
                          >
                            <Download className="w-3.5 h-3.5 text-[#35C98B]" />
                            <span>Download Object</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(obj.checksum);
                              toast.success("SHA-256 Checksum copied");
                            }}
                          >
                            <Share2 className="w-3.5 h-3.5 text-[#5CA9FF]" />
                            <span>Copy SHA-256</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            destructive
                            onClick={() => handleDelete(obj.id, obj.name)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Object</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Data density summary footer */}
        <div className="h-10 px-4 bg-[#0C0E11] border-t border-[#252A31] flex items-center justify-between font-mono text-[11px] text-[#69717D]">
          <div className="flex items-center gap-3">
            <span>Showing {filteredObjects.length} objects</span>
            <span>•</span>
            <span>Total logical: {formatBytes(filteredObjects.reduce((acc, o) => acc + o.size, 0))}</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-[#35C98B] hidden sm:inline">All parity sets verified</span>
          </div>
          <div>Page 1 of 1</div>
        </div>
      </div>

      {/* Details Slide-Over Drawer */}
      <FileDetailsDrawer
        object={selectedObject}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
