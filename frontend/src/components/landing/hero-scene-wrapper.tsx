"use client";

import dynamic from "next/dynamic";
import { Server } from "lucide-react";

export const HeroSceneWrapper = dynamic(
  () =>
    import("@/components/landing/three-hero-scene").then(
      (mod) => mod.ThreeHeroScene
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[460px] sm:h-[520px] rounded-2xl bg-[#111418] border border-[#252A31] flex flex-col items-center justify-center space-y-3 animate-pulse">
        <Server className="w-8 h-8 text-[#4F7CFF]" />
        <span className="font-mono text-xs text-[#9AA3AF]">
          Initializing 3D Cluster Topology...
        </span>
      </div>
    ),
  }
);
