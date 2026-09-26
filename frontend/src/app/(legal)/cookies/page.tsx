import React from "react";

export const metadata = {
  title: "Cookie Policy",
  description: "Cookie policy and session tracking disclosure for Vault.",
};

export default function CookiesPage() {
  return (
    <article className="prose prose-invert max-w-none space-y-6 text-xs sm:text-sm text-[#9AA3AF] leading-relaxed">
      <div className="border-b border-[#252A31] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA]">
          Cookie & Local Storage Policy
        </h1>
        <p className="text-xs text-[#69717D] font-mono mt-1">
          Effective Date: September 26, 2026 • Version 2.4-demo
        </p>
      </div>

      <div className="p-3.5 rounded bg-[#171A1F] border border-[#252A31] text-[11px] text-[#E6B65C]">
        <strong>Demonstration Notice:</strong> Sample cookie and telemetry disclosure for the Vault project.
      </div>

      <h2 className="text-base font-semibold text-[#F5F7FA] pt-2">
        1. Essential Session Cookies
      </h2>
      <p>
        Vault uses strictly necessary cookies and local storage tokens solely to maintain authenticated operator sessions, preserve interface preference flags (such as dark mode and drawer collapse state), and protect against cross-site request forgery (CSRF).
      </p>

      <h2 className="text-base font-semibold text-[#F5F7FA] pt-2">
        2. No Third-Party Marketing Trackers
      </h2>
      <p>
        The Vault web console does not embed third-party advertising trackers, cross-site tracking beacons, or behavioural profiling scripts.
      </p>
    </article>
  );
}
