import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export const metadata = {
  title: "Pricing",
  description: "Transparent infrastructure pricing for Vault distributed storage.",
};

export default function PricingPage() {
  const tiers = [
    {
      name: "Community",
      badge: "Open Infrastructure",
      price: "$0",
      cadence: "forever free",
      description: "Self-hosted clusters for homelabs, startups, and developer test environments.",
      features: [
        "Up to 6 storage nodes",
        "Reed-Solomon RS(4+2) scheme",
        "Full S3 & gRPC compatibility",
        "SHA-256 continuous scrub",
        "Community Discord & GitHub support",
      ],
      cta: "Deploy Cluster",
      href: "/register",
      featured: false,
    },
    {
      name: "Production Cluster",
      badge: "Most Popular",
      price: "$0.008",
      cadence: "per GB / month",
      description: "Enterprise durability for mission-critical databases, AI training datasets, and lakehouses.",
      features: [
        "Unlimited hardware storage nodes",
        "Configurable RS(k+m) erasure matrices",
        "Sub-second autonomous peer repair",
        "Multi-region geo-replication",
        "99.9999999% (9 9s) Durability SLA",
        "24/7 Dedicated SRE on-call support",
      ],
      cta: "Start 14-Day Pilot",
      href: "/register",
      featured: true,
    },
    {
      name: "Enterprise Sovereign",
      badge: "Dedicated Hardware",
      price: "Custom",
      cadence: "annual billing",
      description: "Air-gapped and sovereign government or financial infrastructure installations.",
      features: [
        "On-premise air-gapped deployments",
        "FIPS 140-3 Level 4 hardware enclaves",
        "Custom polynomial SIMD accelerators",
        "Dedicated infrastructure architect",
        "Custom SLA & compliance reporting",
      ],
      cta: "Contact Architecture Team",
      href: "/contact",
      featured: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-mono text-[#4F7CFF] uppercase tracking-wider font-semibold">
          PREDICTABLE CAPACITY PRICING
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F7FA]">
          50% Less Overhead Than Traditional Replication
        </h1>
        <p className="text-sm sm:text-base text-[#9AA3AF] leading-relaxed">
          Pay for the storage you actually use. Zero egress tax, zero API request penalties.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`p-6 rounded-xl flex flex-col justify-between space-y-6 ${
              tier.featured
                ? "bg-[#171A1F] border-2 border-[#4F7CFF] shadow-2xl relative"
                : "bg-[#111418] border border-[#252A31]"
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#F5F7FA]">
                  {tier.name}
                </h3>
                <Badge variant={tier.featured ? "default" : "secondary"}>
                  {tier.badge}
                </Badge>
              </div>

              <div>
                <span className="text-3xl sm:text-4xl font-bold font-mono text-[#F5F7FA]">
                  {tier.price}
                </span>
                <span className="text-xs text-[#9AA3AF] ml-2">{tier.cadence}</span>
              </div>

              <p className="text-xs text-[#9AA3AF] leading-relaxed">
                {tier.description}
              </p>

              <div className="space-y-2.5 pt-4 border-t border-[#1E2229] text-xs">
                {tier.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-[#F5F7FA]">
                    <Check className="w-4 h-4 text-[#35C98B] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link href={tier.href}>
              <Button
                variant={tier.featured ? "default" : "secondary"}
                className="w-full justify-center"
              >
                {tier.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
