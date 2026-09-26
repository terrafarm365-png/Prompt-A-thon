"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Play, RotateCcw, Cpu, HardDrive } from "lucide-react";

interface NodeData {
  id: string;
  name: string;
  role: string;
  shard: string;
  shardType: "data" | "parity";
  angle: number;
  mesh?: THREE.Group;
  light?: THREE.PointLight;
}

const NODES_CONFIG: NodeData[] = [
  { id: "node-a", name: "NODE A", role: "us-east-1a", shard: "D1", shardType: "data", angle: 0 },
  { id: "node-b", name: "NODE B", role: "us-east-1b", shard: "D2", shardType: "data", angle: Math.PI / 3 },
  { id: "node-c", name: "NODE C", role: "us-east-1c", shard: "D3", shardType: "data", angle: (2 * Math.PI) / 3 },
  { id: "node-d", name: "NODE D", role: "us-east-2a", shard: "D4", shardType: "data", angle: Math.PI },
  { id: "node-e", name: "NODE E", role: "us-east-2b", shard: "P1", shardType: "parity", angle: (4 * Math.PI) / 3 },
  { id: "node-f", name: "NODE F", role: "us-east-2c", shard: "P2", shardType: "parity", angle: (5 * Math.PI) / 3 },
];

export function ThreeHeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pipelineStage, setPipelineStage] = useState<number>(0);
  const [stageName, setStageName] = useState<string>("CLUSTER READY");
  const [activePacketLabel, setActivePacketLabel] = useState<string>("project.zip (200 MB)");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  const stageRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const pausedRef = useRef<boolean>(false);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setTimeout(() => setWebGLSupported(false), 0);
        return;
      }
    } catch {
      setTimeout(() => setWebGLSupported(false), 0);
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0d10, 0.045);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 5.8, 8.5);
    camera.lookAt(0, 0, 0);

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Lighting (cinematic, cool highlights, no rainbow)
    const ambientLight = new THREE.AmbientLight(0x1a2130, 2.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xdce1ff, 2.0);
    mainLight.position.set(5, 12, 7);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x4f7cff, 1.4);
    rimLight.position.set(-6, -2, -6);
    scene.add(rimLight);

    // 4. Subtle Ground Coordinate Grid
    const gridHelper = new THREE.GridHelper(14, 28, 0x252a31, 0x171a1f);
    gridHelper.position.y = -0.55;
    scene.add(gridHelper);

    // 5. Ambient Floating Telemetry Particles
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = Math.random() * 5 - 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 14;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x4f7cff,
      size: 0.04,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Central VAULT CORE
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Core chassis
    const coreChassisGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.4, 32);
    const coreChassisMat = new THREE.MeshStandardMaterial({
      color: 0x111418,
      metalness: 0.85,
      roughness: 0.25,
    });
    const coreChassis = new THREE.Mesh(coreChassisGeo, coreChassisMat);
    coreGroup.add(coreChassis);

    // Core pulsing ring
    const coreRingGeo = new THREE.TorusGeometry(1.05, 0.02, 16, 64);
    const coreRingMat = new THREE.MeshBasicMaterial({
      color: 0x4f7cff,
      transparent: true,
      opacity: 0.8,
    });
    const coreRing = new THREE.Mesh(coreRingGeo, coreRingMat);
    coreRing.rotation.x = Math.PI / 2;
    coreGroup.add(coreRing);

    // Core status glow light
    const coreLight = new THREE.PointLight(0x4f7cff, 2.5, 4);
    coreLight.position.set(0, 0.2, 0);
    coreGroup.add(coreLight);

    // 7. Physical Storage Nodes (Six compact server/storage modules)
    const nodeGroups: THREE.Group[] = [];
    const radius = 3.6;

    NODES_CONFIG.forEach((node) => {
      const x = Math.cos(node.angle) * radius;
      const z = Math.sin(node.angle) * radius;

      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(x, 0, z);
      nodeGroup.rotation.y = -node.angle + Math.PI / 2; // face toward core

      // Server rack chassis
      const chassisGeo = new THREE.BoxGeometry(0.9, 0.65, 0.6);
      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x14171d,
        metalness: 0.8,
        roughness: 0.3,
      });
      const chassis = new THREE.Mesh(chassisGeo, chassisMat);
      chassis.position.y = 0.1;
      nodeGroup.add(chassis);

      // Chassis accent bezel
      const bezelGeo = new THREE.BoxGeometry(0.92, 0.04, 0.62);
      const bezelMat = new THREE.MeshStandardMaterial({
        color: 0x252a31,
        metalness: 0.9,
      });
      const bezelTop = new THREE.Mesh(bezelGeo, bezelMat);
      bezelTop.position.y = 0.43;
      nodeGroup.add(bezelTop);

      // Server drive bays (3 bays)
      for (let b = 0; b < 3; b++) {
        const bayGeo = new THREE.BoxGeometry(0.78, 0.12, 0.02);
        const bayMat = new THREE.MeshStandardMaterial({
          color: 0x1e2023,
          metalness: 0.6,
          roughness: 0.5,
        });
        const bay = new THREE.Mesh(bayGeo, bayMat);
        bay.position.set(0, 0.28 - b * 0.18, 0.31);
        nodeGroup.add(bay);
      }

      // Front LED indicator
      const ledColor = node.shardType === "parity" ? 0xe6b65c : 0x35c98b;
      const ledGeo = new THREE.SphereGeometry(0.025, 8, 8);
      const ledMat = new THREE.MeshBasicMaterial({ color: ledColor });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0.35, 0.35, 0.32);
      nodeGroup.add(led);

      // Shard carrier slot (illuminates during shard transfer)
      const shardSlotGeo = new THREE.BoxGeometry(0.4, 0.2, 0.1);
      const shardSlotMat = new THREE.MeshStandardMaterial({
        color: node.shardType === "parity" ? 0x2a2415 : 0x142035,
        emissive: node.shardType === "parity" ? 0xb58a34 : 0x3257bf,
        emissiveIntensity: 0.3,
      });
      const shardSlot = new THREE.Mesh(shardSlotGeo, shardSlotMat);
      shardSlot.position.set(0, 0.1, 0.31);
      nodeGroup.add(shardSlot);

      scene.add(nodeGroup);
      nodeGroups.push(nodeGroup);
      node.mesh = nodeGroup;
    });

    // 8. Thin elegant data stream paths (connecting Core to each Node)
    const streamCurves: THREE.Line[] = [];
    const streamMaterials: THREE.LineBasicMaterial[] = [];

    NODES_CONFIG.forEach((node) => {
      const x = Math.cos(node.angle) * radius;
      const z = Math.sin(node.angle) * radius;

      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.05, 0),
        new THREE.Vector3(x * 0.45, 0.55, z * 0.45),
        new THREE.Vector3(x * 0.85, 0.15, z * 0.85)
      );

      const points = curve.getPoints(24);
      const streamGeo = new THREE.BufferGeometry().setFromPoints(points);
      const streamMat = new THREE.LineBasicMaterial({
        color: node.shardType === "parity" ? 0xe6b65c : 0x4f7cff,
        transparent: true,
        opacity: 0.25,
      });
      const streamLine = new THREE.Line(streamGeo, streamMat);
      scene.add(streamLine);
      streamCurves.push(streamLine);
      streamMaterials.push(streamMat);
    });

    // 9. Traveling Shard Data Packets (D1-D4 rectangular blue blocks, P1-P2 amber blocks)
    const shardPackets: THREE.Mesh[] = [];
    NODES_CONFIG.forEach((node) => {
      // Data shard: crisp rectangular block. Parity: slightly distinct beveled block
      const packetGeo =
        node.shardType === "parity"
          ? new THREE.CylinderGeometry(0.1, 0.1, 0.08, 6)
          : new THREE.BoxGeometry(0.18, 0.09, 0.12);

      const packetMat = new THREE.MeshStandardMaterial({
        color: node.shardType === "parity" ? 0xe6b65c : 0x5ca9ff,
        emissive: node.shardType === "parity" ? 0xe6b65c : 0x4f7cff,
        emissiveIntensity: 0.8,
        metalness: 0.6,
        roughness: 0.2,
      });

      const packet = new THREE.Mesh(packetGeo, packetMat);
      packet.visible = false;
      scene.add(packet);
      shardPackets.push(packet);
    });

    // Central Ingested File Object: "project.zip 200 MB"
    const fileGeo = new THREE.BoxGeometry(0.4, 0.25, 0.3);
    const fileMat = new THREE.MeshStandardMaterial({
      color: 0x4f7cff,
      emissive: 0x3257bf,
      emissiveIntensity: 0.6,
      metalness: 0.7,
      roughness: 0.3,
    });
    const ingestedFile = new THREE.Mesh(fileGeo, fileMat);
    ingestedFile.position.set(0, 2.8, 0);
    scene.add(ingestedFile);

    // 10. Mouse Interaction / Subtle Parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = x * 0.45;
      targetMouseY = y * 0.25;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    // 11. Main Animation Loop (Finite State Machine Pipeline)
    let animationFrameId: number;
    const startTime = performance.now();
    let lastTime = startTime;
    const totalCycleTime = 8.0; // 8 second cycle

    const STAGES = [
      { name: "01. INGESTION", label: "Receiving project.zip (200 MB)" },
      { name: "02. REED-SOLOMON ENCODING", label: "Generating 4 Data + 2 Parity Shards" },
      { name: "03. PARALLEL SHARD DISTRIBUTION", label: "Distributing D1-D4 & P1-P2 across 6 nodes" },
      { name: "04. CRYPTOGRAPHIC VERIFICATION", label: "SHA-256 integrity validation passed" },
      { name: "05. OBJECT PROTECTED", label: "Cluster Durability: 99.999999999% guaranteed" },
    ];

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) * 0.001;
      lastTime = now;
      const elapsedTime = (now - startTime) * 0.001;

      // Smooth mouse parallax
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;
      camera.position.x = Math.sin(currentMouseX) * 2.5;
      camera.position.y = 5.8 + currentMouseY * 1.5;
      camera.lookAt(0, 0.2, 0);

      // Core subtle rotation and pulse
      coreGroup.rotation.y += 0.008;
      coreRing.rotation.z += 0.015;
      coreRingMat.opacity = 0.5 + Math.sin(elapsedTime * 3) * 0.3;

      // Subtle particle float
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += Math.sin(elapsedTime + i) * 0.002;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Pipeline State Machine
      if (!pausedRef.current) {
        progressRef.current = (progressRef.current + delta) % totalCycleTime;
        const progress = progressRef.current / totalCycleTime;

        let currentStageIndex = 0;
        if (progress < 0.2) currentStageIndex = 0; // Ingestion
        else if (progress < 0.42) currentStageIndex = 1; // Encoding
        else if (progress < 0.72) currentStageIndex = 2; // Distribution
        else if (progress < 0.88) currentStageIndex = 3; // Verification
        else currentStageIndex = 4; // Protected

        if (currentStageIndex !== stageRef.current) {
          stageRef.current = currentStageIndex;
          setPipelineStage(currentStageIndex);
          setStageName(STAGES[currentStageIndex].name);
          setActivePacketLabel(STAGES[currentStageIndex].label);
        }

        // STAGE 0: Ingesting file descends into Core
        if (currentStageIndex === 0) {
          const t = progress / 0.2; // 0 -> 1
          ingestedFile.visible = true;
          ingestedFile.position.set(0, 2.8 - t * 2.4, 0);
          ingestedFile.scale.setScalar(1 - t * 0.3);
          shardPackets.forEach((p) => (p.visible = false));
          streamMaterials.forEach((m) => (m.opacity = 0.15));
        }
        // STAGE 1: Core encoding pulse
        else if (currentStageIndex === 1) {
          ingestedFile.visible = false;
          const t = (progress - 0.2) / 0.22;
          coreLight.intensity = 2.5 + Math.sin(t * Math.PI * 4) * 2.0;

          // Shards appear inside core ready to dispatch
          shardPackets.forEach((p, idx) => {
            p.visible = true;
            const angle = NODES_CONFIG[idx].angle;
            p.position.set(
              Math.cos(angle) * (0.4 + t * 0.3),
              0.2,
              Math.sin(angle) * (0.4 + t * 0.3)
            );
          });
          streamMaterials.forEach((m) => (m.opacity = 0.35));
        }
        // STAGE 2: Parallel shard distribution along streams to nodes
        else if (currentStageIndex === 2) {
          ingestedFile.visible = false;
          const t = (progress - 0.42) / 0.3; // 0 -> 1
          streamMaterials.forEach((m) => (m.opacity = 0.7));

          shardPackets.forEach((packet, idx) => {
            packet.visible = true;
            const node = NODES_CONFIG[idx];
            const dist = 0.5 + t * (radius * 0.9 - 0.5);
            const x = Math.cos(node.angle) * dist;
            const z = Math.sin(node.angle) * dist;
            const yArc = Math.sin(t * Math.PI) * 0.6 + 0.15;

            packet.position.set(x, yArc, z);
            packet.rotation.y += 0.04;
          });
        }
        // STAGE 3: Verification (packets arrive at nodes, node LEDs flash)
        else if (currentStageIndex === 3) {
          const t = (progress - 0.72) / 0.16;
          streamMaterials.forEach((m) => (m.opacity = 0.3));

          shardPackets.forEach((packet, idx) => {
            const node = NODES_CONFIG[idx];
            packet.position.set(
              Math.cos(node.angle) * (radius * 0.88),
              0.1,
              Math.sin(node.angle) * (radius * 0.88)
            );
          });

          // Node chassis emissive glow pulse
          nodeGroups.forEach((g) => {
            g.position.y = Math.sin(t * Math.PI * 2) * 0.04;
          });
        }
        // STAGE 4: Protected steady state
        else {
          shardPackets.forEach((p) => (p.visible = false));
          streamMaterials.forEach((m) => (m.opacity = 0.2));
          ingestedFile.visible = false;
          coreLight.intensity = 2.0;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  const handleReset = () => {
    progressRef.current = 0;
    stageRef.current = 0;
    setPipelineStage(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[460px] sm:h-[520px] rounded-2xl bg-gradient-to-b from-[#111418] via-[#0D0F13] to-[#0B0D10] border border-[#252A31] overflow-hidden select-none shadow-2xl group"
    >
      {/* Fallback for non-WebGL / Reduced Motion */}
      {!webGLSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <HardDrive className="w-12 h-12 text-[#4F7CFF] animate-pulse" />
          <h3 className="text-base font-semibold text-[#F5F7FA]">
            6-Node Distributed Storage Mesh
          </h3>
          <p className="text-xs text-[#9AA3AF] max-w-sm">
            Objects are automatically partitioned into 4 data shards and 2 parity shards across discrete failure domains.
          </p>
          <div className="flex gap-2">
            {["D1", "D2", "D3", "D4"].map((s) => (
              <Badge key={s} variant="default" className="font-mono text-xs">
                {s} (Data)
              </Badge>
            ))}
            {["P1", "P2"].map((s) => (
              <Badge key={s} variant="warning" className="font-mono text-xs">
                {s} (Parity)
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Top Telemetry Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#35C98B] animate-ping" />
          <span className="font-mono text-[11px] text-[#9AA3AF] uppercase tracking-wider">
            3D CLUSTER TOPOLOGY • REED-SOLOMON RS(4+2)
          </span>
        </div>

        <Badge variant={pipelineStage === 4 ? "success" : "default"} className="font-mono text-[10px]">
          {stageName}
        </Badge>
      </div>

      {/* Active Pipeline Stage Banner */}
      <div className="absolute top-12 left-4 z-10 pointer-events-none">
        <div className="px-3 py-1.5 rounded bg-[#171A1F]/90 backdrop-blur-md border border-[#252A31] shadow-lg">
          <span className="text-[11px] font-mono text-[#F5F7FA] flex items-center gap-2">
            <span className="text-[#4F7CFF] font-bold">STREAM:</span> {activePacketLabel}
          </span>
        </div>
      </div>

      {/* Node Fleet Overlay Badges (Positions mapped in 3D) */}
      <div className="absolute bottom-16 left-4 right-4 flex items-center justify-between flex-wrap gap-2 pointer-events-auto z-10">
        {NODES_CONFIG.map((n) => (
          <div
            key={n.id}
            onMouseEnter={() => setHoveredNode(n.name)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`px-2.5 py-1 rounded bg-[#0C0E11]/90 backdrop-blur border text-[10px] font-mono transition-all cursor-pointer ${
              hoveredNode === n.name
                ? "border-[#4F7CFF] shadow-[0_0_12px_rgba(79,124,255,0.4)] text-[#F5F7FA]"
                : "border-[#252A31] text-[#9AA3AF] hover:border-[#4F7CFF]/50"
            }`}
          >
            <span className="font-bold text-[#F5F7FA]">{n.name}</span>{" "}
            <span className={n.shardType === "parity" ? "text-[#E6B65C]" : "text-[#5CA9FF]"}>
              [{n.shard}]
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#69717D]">
          <Cpu className="w-3.5 h-3.5 text-[#4F7CFF]" />
          <span>VAULT CORE: ACTIVE</span>
          <span className="text-[#252A31]">|</span>
          <span className="text-[#35C98B] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> 6/6 NODES ONLINE
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-2.5 py-1 rounded bg-[#171A1F] hover:bg-[#252A31] border border-[#252A31] text-xs font-mono text-[#F5F7FA] transition-colors flex items-center gap-1.5"
            title={isPaused ? "Resume pipeline" : "Pause pipeline"}
          >
            <Play className={`w-3 h-3 ${!isPaused ? "text-[#35C98B]" : "text-[#9AA3AF]"}`} />
            <span>{isPaused ? "RESUME" : "PAUSE"}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1 rounded bg-[#171A1F] hover:bg-[#252A31] border border-[#252A31] text-xs text-[#9AA3AF] hover:text-[#F5F7FA] transition-colors"
            title="Restart pipeline cycle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
