"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [dataShards, setDataShards] = useState(4);
  const [parityShards, setParityShards] = useState(2);
  const [autoRepair, setAutoRepair] = useState(true);
  const [scrubDays, setScrubDays] = useState(7);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleSave = () => {
    toast.success("Cluster configuration parameters updated");
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText("vault_sec_live_99f2b84c01a792e48bce");
    setCopiedKey(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F5F7FA]">
          Cluster & System Settings
        </h1>
        <p className="text-xs text-[#9AA3AF] mt-0.5">
          Tune durability redundancy parameters, cryptographic verification schedules, and API access tokens.
        </p>
      </div>

      <Tabs defaultValue="durability">
        <TabsList className="mb-4">
          <TabsTrigger value="durability">Durability & EC</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="storage">Storage Quotas</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        {/* Durability Tab */}
        <TabsContent value="durability" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reed-Solomon Erasure Coding Parameters</CardTitle>
                  <CardDescription>
                    Configure shard striping topology for new objects written to the storage mesh.
                  </CardDescription>
                </div>
                <Badge variant="default">RS({dataShards}+{parityShards})</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#F5F7FA]">
                    Data Shards (k)
                  </label>
                  <Input
                    type="number"
                    min={2}
                    max={16}
                    value={dataShards}
                    onChange={(e) => setDataShards(parseInt(e.target.value) || 4)}
                    compact
                  />
                  <p className="text-[11px] text-[#69717D]">
                    Number of original data chunks an object payload is partitioned into.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#F5F7FA]">
                    Parity Shards (m)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={8}
                    value={parityShards}
                    onChange={(e) => setParityShards(parseInt(e.target.value) || 2)}
                    compact
                  />
                  <p className="text-[11px] text-[#69717D]">
                    Number of parity calculation blocks generated. Equivalent to tolerable node losses.
                  </p>
                </div>
              </div>

              {/* Explanatory banner */}
              <div className="p-3.5 rounded bg-[#0C0E11] border border-[#252A31] space-y-1 text-xs">
                <span className="text-[#35C98B] font-semibold block">
                  Cluster Guarantee: RS({dataShards}+{parityShards}) Matrix
                </span>
                <p className="text-[#9AA3AF] text-[11px] leading-relaxed">
                  With {dataShards} data shards and {parityShards} parity shards, your cluster requires at least {dataShards + parityShards} storage nodes. Any {parityShards} nodes can fail concurrently without data loss, requiring {( (dataShards + parityShards) / dataShards ).toFixed(2)}x raw physical storage overhead.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#1E2229]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-medium text-[#F5F7FA]">
                      Autonomous Background Repair
                    </h4>
                    <p className="text-[11px] text-[#9AA3AF]">
                      Automatically initiate peer-to-peer parity reconstruction when a shard lease expires.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoRepair}
                    onChange={(e) => setAutoRepair(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#171A1F] border-[#252A31] accent-[#4F7CFF] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-xs font-medium text-[#F5F7FA]">
                      Cryptographic Bit-Rot Scrub Interval
                    </h4>
                    <p className="text-[11px] text-[#9AA3AF]">
                      Continuous background disk verification frequency.
                    </p>
                  </div>
                  <select
                    value={scrubDays}
                    onChange={(e) => setScrubDays(parseInt(e.target.value))}
                    aria-label="Scrub interval"
                    className="h-8 rounded border border-[#252A31] bg-[#0C0E11] px-2 text-xs text-[#F5F7FA]"
                  >
                    <option value={1}>Every 24 Hours</option>
                    <option value={7}>Every 7 Days</option>
                    <option value={14}>Every 14 Days</option>
                    <option value={30}>Every 30 Days</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} size="sm">
                Save Durability Profile
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace & Node Cluster Name</CardTitle>
              <CardDescription>System identifiers for this Vault deployment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#F5F7FA]">Cluster Identifier</label>
                <Input defaultValue="prod-cluster-01" compact />
              </div>
              <div className="space-y-1.5">
                <label className="text-[#F5F7FA]">Default Bucket Namespace</label>
                <Input defaultValue="vault-prod-east1" compact />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} size="sm">
                Update Identifiers
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Storage Quotas Tab */}
        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quota Management</CardTitle>
              <CardDescription>Capacity limits and eviction rules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#F5F7FA]">Maximum Capacity Cap</label>
                <Input defaultValue="10 TB" compact />
              </div>
              <div className="space-y-1.5">
                <label className="text-[#F5F7FA]">Warning Alert Threshold</label>
                <Input defaultValue="85%" compact />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} size="sm">
                Save Quotas
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cryptographic Enclave & TLS</CardTitle>
              <CardDescription>In-transit and at-rest encryption parameters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#1E2229]">
                <div>
                  <h4 className="font-medium text-[#F5F7FA]">mTLS Node-to-Node Interconnect</h4>
                  <p className="text-[11px] text-[#9AA3AF]">Mutual certificate verification for shard traffic.</p>
                </div>
                <Badge variant="success">Enforced</Badge>
              </div>
              <div className="flex justify-between py-2">
                <div>
                  <h4 className="font-medium text-[#F5F7FA]">At-Rest Shard Encryption</h4>
                  <p className="text-[11px] text-[#9AA3AF]">AES-256-GCM hardware accelerated block cipher.</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programmatic API Tokens</CardTitle>
              <CardDescription>S3-compatible and gRPC access credentials.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#9AA3AF]">Production Ingress Key</label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value="vault_sec_live_99f2b84c01a792e48bce"
                    compact
                    className="font-mono text-xs"
                  />
                  <Button variant="secondary" size="sm" onClick={handleCopyKey}>
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-[#35C98B]" /> : "Copy"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
