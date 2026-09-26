"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { CinematicStory } from "./cinematic-story";
import { SmoothScroll } from "./smooth-scroll";
import { Server } from "lucide-react";

// Client-only dynamic WebGL canvas to protect SSR and avoid hydration mismatch
const DynamicCinematicCanvas = dynamic(
  () => import("./cinematic-canvas").then((mod) => mod.CinematicCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#0B0D10] flex items-center justify-center pointer-events-none z-0">
        <Server className="w-8 h-8 text-[#4F7CFF] animate-pulse" />
      </div>
    ),
  }
);

const SCENE_NAMES = [
  "01. Architecture Opening",
  "02. Data Enters Vault",
  "03. Polynomial Striping",
  "04. Concurrent Routing",
  "05. Hardware Node Failure",
  "06. Galois Reconstruction",
  "07. Autonomous Node Repair",
  "08. Cryptographic Integrity",
  "09. Distributed System Scale",
  "10. 3D Architectural Stack",
  "11. Operator Console",
];

export function CinematicExperience() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeScene, setActiveScene] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;
      setScrollProgress(progress);

      // Determine active scene based on section bounds
      const sceneCount = 11;
      const current = Math.min(sceneCount - 1, Math.floor(progress * sceneCount));
      setActiveScene(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToScene = (index: number) => {
    const target = document.getElementById(`scene-${index}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <SmoothScroll>
      <div className="relative min-h-screen bg-[#0B0D10] text-[#F5F7FA] overflow-x-hidden selection:bg-[#4F7CFF] selection:text-white">
        {/* Full-Screen 3D WebGL Canvas Layer */}
        <DynamicCinematicCanvas
          scrollProgress={scrollProgress}
          activeScene={activeScene}
        />

        {/* Minimal Floating Right-Hand Scene Indicator (Desktop) */}
        <div className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-2 font-mono text-[10px] pointer-events-auto select-none">
          <span className="text-[#69717D] text-[9px] mb-1">
            SCENE {String(activeScene + 1).padStart(2, "0")} / 11
          </span>
          {SCENE_NAMES.map((name, idx) => (
            <button
              key={name}
              onClick={() => scrollToScene(idx)}
              className="flex items-center gap-2 group cursor-pointer"
              title={name}
            >
              <span
                className={`opacity-0 group-hover:opacity-100 transition-opacity text-[#9AA3AF] text-[9px] ${
                  activeScene === idx ? "opacity-100 text-[#4F7CFF] font-bold" : ""
                }`}
              >
                {name.split(". ")[1]}
              </span>
              <span
                className={`w-1.5 h-6 rounded-full transition-all duration-300 ${
                  activeScene === idx
                    ? "bg-[#4F7CFF] h-8 shadow-[0_0_8px_rgba(79,124,255,0.8)]"
                    : "bg-[#252A31] group-hover:bg-[#4F7CFF]/50"
                }`}
              />
            </button>
          ))}
        </div>

        {/* 11 Full-Screen Storytelling Scenes */}
        <CinematicStory
          onScrollToNext={scrollToScene}
          activeScene={activeScene}
        />
      </div>
    </SmoothScroll>
  );
}
