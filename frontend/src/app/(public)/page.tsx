import React from "react";
import { CinematicExperience } from "@/components/cinematic/cinematic-experience";

export const metadata = {
  title: "Vault — Distributed Object Storage Built for Resilience",
  description:
    "Vault distributes, verifies, and recovers your data across independent storage nodes using Reed-Solomon RS(4+2) erasure coding.",
};

export default function LandingPage() {
  return <CinematicExperience />;
}
