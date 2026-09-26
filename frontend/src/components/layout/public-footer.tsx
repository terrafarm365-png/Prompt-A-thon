import React from "react";
import Link from "next/link";
import { VaultLogo } from "./vault-logo";

export function PublicFooter() {
  return (
    <footer className="w-full border-t border-[#252A31] bg-[#0B0D10] text-[#9AA3AF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand info */}
          <div className="col-span-2 space-y-3">
            <VaultLogo showText={true} />
            <p className="text-xs text-[#9AA3AF] max-w-sm leading-relaxed">
              Distributed object storage platform built for high resilience, Reed-Solomon erasure coding, and autonomous shard repair.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-[#9AA3AF]">
              <span className="w-2 h-2 rounded-full bg-[#35C98B] animate-pulse" />
              <span>US-East Cluster: All 6 Storage Nodes Online</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-[#F5F7FA] uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/features" className="hover:text-[#F5F7FA] transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#F5F7FA] transition-colors">
                  How Vault Works
                </Link>
              </li>
              <li>
                <Link href="/architecture" className="hover:text-[#F5F7FA] transition-colors">
                  Architecture
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-[#F5F7FA] transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#F5F7FA] transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="text-xs font-semibold text-[#F5F7FA] uppercase tracking-wider mb-3">
              Developers
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/docs" className="hover:text-[#F5F7FA] transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-[#F5F7FA] transition-colors">
                  Status Monitor
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#F5F7FA] transition-colors">
                  Contact & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-[#F5F7FA] uppercase tracking-wider mb-3">
              Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-[#F5F7FA] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#F5F7FA] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-[#F5F7FA] transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="hover:text-[#F5F7FA] transition-colors">
                  Acceptable Use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#1E2229] flex flex-col sm:flex-row items-center justify-between text-xs text-[#69717D]">
          <p>© {new Date().getFullYear()} Vault Systems Inc. Distributed infrastructure grade.</p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0 font-mono text-[11px]">
            <span>RS(4+2) Reed-Solomon</span>
            <span>•</span>
            <span>SHA-256 Validated</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
