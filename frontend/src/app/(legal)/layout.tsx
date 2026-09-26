import React from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F5F7FA] flex flex-col justify-between">
      <PublicNavbar />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="p-8 sm:p-12 rounded-xl bg-[#111418] border border-[#252A31]">
          {children}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
