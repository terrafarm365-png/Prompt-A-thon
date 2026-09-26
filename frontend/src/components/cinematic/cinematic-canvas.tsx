"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface CinematicCanvasProps {
  scrollProgress: number; // 0.0 to 1.0
  activeScene: number; // 0 to 10
}

interface NodeMeshConfig {
  id: string;
  name: string;
  angle: number;
  shard: string;
  isParity: boolean;
  group: THREE.Group;
  led: THREE.Mesh;
  light: THREE.PointLight;
}

// 11 Camera Waypoints for the 11 Cinematic Scenes
const CAMERA_WAYPOINTS = [
  // Scene 01: Hero Opening (Wide perspective looking at full cluster)
  { pos: new THREE.Vector3(0, 4.2, 9.5), target: new THREE.Vector3(0, 0.2, 0) },
  // Scene 02: Data Enters (Pans down-in, tracking ingested project.zip descending)
  { pos: new THREE.Vector3(0, 3.2, 6.2), target: new THREE.Vector3(0, 0.8, 0) },
  // Scene 03: Data Split (Close up on Core as 6 shards separate in 3D)
  { pos: new THREE.Vector3(0, 2.2, 4.8), target: new THREE.Vector3(0, 0.5, 0) },
  // Scene 04: Distribution (Pulls back to watch shards route to 6 nodes)
  { pos: new THREE.Vector3(0, 4.5, 8.5), target: new THREE.Vector3(0, 0, 0) },
  // Scene 05: Node Failure (Focus tightens toward Node C as it turns red and powers down)
  { pos: new THREE.Vector3(-2.2, 1.8, 4.2), target: new THREE.Vector3(-2.8, 0.2, -1.2) },
  // Scene 06: Reconstruction (Camera pans center-right, surviving shards emit Galois rays)
  { pos: new THREE.Vector3(0.5, 2.2, 5.0), target: new THREE.Vector3(0, 0.6, 0) },
  // Scene 07: Automatic Repair (Focus shifts toward newly deployed Node G standby)
  { pos: new THREE.Vector3(2.5, 1.8, 4.5), target: new THREE.Vector3(3.2, 0.2, 0.8) },
  // Scene 08: Integrity Scrub (Close horizontal view as laser sweep validates SHA-256)
  { pos: new THREE.Vector3(0, 1.4, 3.8), target: new THREE.Vector3(0, 0.4, 0) },
  // Scene 09: System Scale (Massive dramatic pull-back showing cluster constellation)
  { pos: new THREE.Vector3(0, 8.5, 13.5), target: new THREE.Vector3(0, 0, 0) },
  // Scene 10: 3D Architecture Stack (Side-isometric angle framing vertical architecture layers)
  { pos: new THREE.Vector3(-3.5, 3.5, 7.5), target: new THREE.Vector3(0, 1.5, 0) },
  // Scene 11: Dashboard Reveal / CTA (Forward approach into central console view)
  { pos: new THREE.Vector3(0, 2.8, 7.0), target: new THREE.Vector3(0, 0.5, 0) },
];

export function CinematicCanvas({ scrollProgress, activeScene }: CinematicCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  const scrollRef = useRef<number>(0);
  const activeSceneRef = useRef<number>(0);

  useEffect(() => {
    scrollRef.current = scrollProgress;
    activeSceneRef.current = activeScene;
  }, [scrollProgress, activeScene]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability safely
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

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Cinematic Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0d10, 0.042);

    // 2. Perspective Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.copy(CAMERA_WAYPOINTS[0].pos);
    const cameraTarget = new THREE.Vector3().copy(CAMERA_WAYPOINTS[0].target);
    camera.lookAt(cameraTarget);

    // 3. Renderer with ACES Filmic tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Cinematic Lighting (Dark environment, soft rim, blue-white highlights, no neon)
    const ambientLight = new THREE.AmbientLight(0x161e2e, 2.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xdbe3ff, 2.2);
    keyLight.position.set(6, 14, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x4f7cff, 1.8);
    rimLight.position.set(-8, -2, -6);
    scene.add(rimLight);

    // 5. Subtle Ground Infrastructure Grid
    const grid = new THREE.GridHelper(20, 40, 0x252a31, 0x14171d);
    grid.position.y = -0.52;
    scene.add(grid);

    // 6. Atmospheric Floating Telemetry Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 18;
      particlePositions[i + 1] = Math.random() * 6 - 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 18;
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

    // 7. Central VAULT CORE
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Core chassis cylinder
    const coreCylinderGeo = new THREE.CylinderGeometry(0.9, 1.05, 0.45, 32);
    const coreCylinderMat = new THREE.MeshStandardMaterial({
      color: 0x111418,
      metalness: 0.85,
      roughness: 0.25,
    });
    const coreCylinder = new THREE.Mesh(coreCylinderGeo, coreCylinderMat);
    coreGroup.add(coreCylinder);

    // Core inner glowing ring
    const coreRingGeo = new THREE.TorusGeometry(1.15, 0.02, 16, 64);
    const coreRingMat = new THREE.MeshBasicMaterial({
      color: 0x4f7cff,
      transparent: true,
      opacity: 0.85,
    });
    const coreRing = new THREE.Mesh(coreRingGeo, coreRingMat);
    coreRing.rotation.x = Math.PI / 2;
    coreGroup.add(coreRing);

    // Core central status light
    const coreLight = new THREE.PointLight(0x4f7cff, 2.8, 5);
    coreLight.position.set(0, 0.3, 0);
    coreGroup.add(coreLight);

    // 8. 6 Primary Physical Storage Nodes (Nodes A–F)
    const nodeConfigs: NodeMeshConfig[] = [];
    const radius = 3.8;
    const nodeNames = [
      { id: "node-a", name: "NODE A", shard: "D1", isParity: false },
      { id: "node-b", name: "NODE B", shard: "D2", isParity: false },
      { id: "node-c", name: "NODE C", shard: "D3", isParity: false }, // Will fail in Scene 05
      { id: "node-d", name: "NODE D", shard: "D4", isParity: false },
      { id: "node-e", name: "NODE E", shard: "P1", isParity: true },
      { id: "node-f", name: "NODE F", shard: "P2", isParity: true },
    ];

    nodeNames.forEach((item, i) => {
      const angle = (i * 2 * Math.PI) / 6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = -angle + Math.PI / 2; // Orient toward core

      // Server rack chassis (brushed graphite finish)
      const chassisGeo = new THREE.BoxGeometry(0.95, 0.7, 0.65);
      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x14171d,
        metalness: 0.85,
        roughness: 0.3,
      });
      const chassis = new THREE.Mesh(chassisGeo, chassisMat);
      chassis.position.y = 0.12;
      group.add(chassis);

      // Chassis structural top bezel
      const topBezelGeo = new THREE.BoxGeometry(0.98, 0.04, 0.68);
      const topBezelMat = new THREE.MeshStandardMaterial({
        color: 0x252a31,
        metalness: 0.9,
      });
      const topBezel = new THREE.Mesh(topBezelGeo, topBezelMat);
      topBezel.position.y = 0.48;
      group.add(topBezel);

      // 3 horizontal drive bays
      for (let b = 0; b < 3; b++) {
        const bayGeo = new THREE.BoxGeometry(0.8, 0.13, 0.02);
        const bayMat = new THREE.MeshStandardMaterial({
          color: 0x1e2023,
          metalness: 0.6,
          roughness: 0.5,
        });
        const bay = new THREE.Mesh(bayGeo, bayMat);
        bay.position.set(0, 0.32 - b * 0.19, 0.33);
        group.add(bay);
      }

      // Status indicator LED
      const ledGeo = new THREE.SphereGeometry(0.028, 8, 8);
      const ledMat = new THREE.MeshBasicMaterial({
        color: item.isParity ? 0xe6b65c : 0x35c98b,
      });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0.38, 0.38, 0.34);
      group.add(led);

      const nodeLight = new THREE.PointLight(
        item.isParity ? 0xe6b65c : 0x4f7cff,
        0.8,
        2.5
      );
      nodeLight.position.set(0, 0.3, 0.35);
      group.add(nodeLight);

      scene.add(group);

      nodeConfigs.push({
        id: item.id,
        name: item.name,
        angle,
        shard: item.shard,
        isParity: item.isParity,
        group,
        led,
        light: nodeLight,
      });
    });

    // 9. Hot Standby Node G (Scene 07 Automatic Repair)
    const nodeGGroup = new THREE.Group();
    nodeGGroup.position.set(3.5, 0, 1.2);
    nodeGGroup.rotation.y = -Math.PI / 4;
    nodeGGroup.visible = false; // Becomes visible in Scene 07

    const nodeGChassisGeo = new THREE.BoxGeometry(0.95, 0.7, 0.65);
    const nodeGChassisMat = new THREE.MeshStandardMaterial({
      color: 0x14171d,
      metalness: 0.85,
      roughness: 0.3,
    });
    const nodeGChassis = new THREE.Mesh(nodeGChassisGeo, nodeGChassisMat);
    nodeGChassis.position.y = 0.12;
    nodeGGroup.add(nodeGChassis);

    const nodeGLedGeo = new THREE.SphereGeometry(0.028, 8, 8);
    const nodeGLedMat = new THREE.MeshBasicMaterial({ color: 0x35c98b });
    const nodeGLed = new THREE.Mesh(nodeGLedGeo, nodeGLedMat);
    nodeGLed.position.set(0.38, 0.38, 0.34);
    nodeGGroup.add(nodeGLed);

    scene.add(nodeGGroup);

    // 10. Data Stream Curves from Core to Nodes A–F
    const streamLines: THREE.Line[] = [];
    const streamMaterials: THREE.LineBasicMaterial[] = [];

    nodeConfigs.forEach((node) => {
      const x = Math.cos(node.angle) * radius;
      const z = Math.sin(node.angle) * radius;

      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.08, 0),
        new THREE.Vector3(x * 0.45, 0.65, z * 0.45),
        new THREE.Vector3(x * 0.88, 0.2, z * 0.88)
      );

      const points = curve.getPoints(24);
      const streamGeo = new THREE.BufferGeometry().setFromPoints(points);
      const streamMat = new THREE.LineBasicMaterial({
        color: node.isParity ? 0xe6b65c : 0x4f7cff,
        transparent: true,
        opacity: 0.2,
      });
      const line = new THREE.Line(streamGeo, streamMat);
      scene.add(line);
      streamLines.push(line);
      streamMaterials.push(streamMat);
    });

    // 11. Traveling Shard Data Packets (D1–D4, P1–P2)
    const shardPackets: THREE.Mesh[] = [];
    nodeConfigs.forEach((node) => {
      const packetGeo = node.isParity
        ? new THREE.CylinderGeometry(0.1, 0.1, 0.09, 6)
        : new THREE.BoxGeometry(0.18, 0.1, 0.14);

      const packetMat = new THREE.MeshStandardMaterial({
        color: node.isParity ? 0xe6b65c : 0x5ca9ff,
        emissive: node.isParity ? 0xe6b65c : 0x4f7cff,
        emissiveIntensity: 0.8,
        metalness: 0.6,
        roughness: 0.2,
      });

      const packet = new THREE.Mesh(packetGeo, packetMat);
      packet.visible = false;
      scene.add(packet);
      shardPackets.push(packet);
    });

    // 12. Main Ingested File Representation (project.zip 200 MB)
    const fileBlockGeo = new THREE.BoxGeometry(0.5, 0.32, 0.35);
    const fileBlockMat = new THREE.MeshStandardMaterial({
      color: 0x4f7cff,
      emissive: 0x3257bf,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.25,
    });
    const fileBlock = new THREE.Mesh(fileBlockGeo, fileBlockMat);
    fileBlock.position.set(0, 3.2, 0);
    scene.add(fileBlock);

    // 13. Integrity Laser Scan Line (Scene 08)
    const scanPlaneGeo = new THREE.PlaneGeometry(1.6, 0.04);
    const scanPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x35c98b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const scanLaser = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanLaser.rotation.x = Math.PI / 2;
    scanLaser.position.set(0, 0.5, 0);
    scanLaser.visible = false;
    scene.add(scanLaser);

    // 14. 3D Architectural Stack Layers (Scene 10)
    const archLayersGroup = new THREE.Group();
    archLayersGroup.position.set(0, 0, 0);
    archLayersGroup.visible = false;
    scene.add(archLayersGroup);

    const layerColors = [0x4f7cff, 0x5ca9ff, 0x35c98b, 0x8d90a0, 0xe6b65c, 0x4f7cff];
    for (let l = 0; l < 6; l++) {
      const layerGeo = new THREE.BoxGeometry(2.4, 0.08, 1.4);
      const layerMat = new THREE.MeshStandardMaterial({
        color: 0x14171d,
        emissive: layerColors[l],
        emissiveIntensity: 0.35,
        metalness: 0.85,
        roughness: 0.3,
        transparent: true,
        opacity: 0.85,
      });
      const layerMesh = new THREE.Mesh(layerGeo, layerMat);
      layerMesh.position.y = 0.5 + l * 0.45;
      archLayersGroup.add(layerMesh);
    }

    // 15. Mouse Parallax Handlers
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = x * 0.35;
      targetMouseY = y * 0.2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    // 16. Continuous Render & Camera Choreography Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) * 0.001;
      const progress = Math.max(0, Math.min(1, scrollRef.current));

      // Calculate Waypoint Interpolation based on 11 scenes
      // progress: 0.0 -> Scene 0, 1.0 -> Scene 10
      const totalScenes = CAMERA_WAYPOINTS.length - 1;
      const exactIndex = progress * totalScenes;
      const baseIndex = Math.min(Math.floor(exactIndex), totalScenes - 1);
      const nextIndex = Math.min(baseIndex + 1, totalScenes);
      const stepT = exactIndex - baseIndex;

      const currentWaypoint = CAMERA_WAYPOINTS[baseIndex];
      const nextWaypoint = CAMERA_WAYPOINTS[nextIndex];

      // Target position along waypoint splines
      const targetCamPos = new THREE.Vector3().lerpVectors(
        currentWaypoint.pos,
        nextWaypoint.pos,
        stepT
      );
      const targetCamLook = new THREE.Vector3().lerpVectors(
        currentWaypoint.target,
        nextWaypoint.target,
        stepT
      );

      // Smooth mouse parallax damping
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      targetCamPos.x += Math.sin(currentMouseX) * 0.6;
      targetCamPos.y += currentMouseY * 0.4;

      // Smooth camera position interpolation
      camera.position.lerp(targetCamPos, 0.08);
      cameraTarget.lerp(targetCamLook, 0.08);
      camera.lookAt(cameraTarget);

      // Core rotation
      coreGroup.rotation.y += 0.006;
      coreRing.rotation.z += 0.012;
      coreRingMat.opacity = 0.5 + Math.sin(elapsedTime * 2.5) * 0.3;

      // Drift subtle ambient particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += Math.sin(elapsedTime + i) * 0.0015;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // ==========================================
      // SCENE-SPECIFIC 3D STATES DRIVEN BY SCROLL
      // ==========================================
      const sceneIndex = activeSceneRef.current;

      // SCENE 01: Hero Opening
      if (sceneIndex === 0) {
        fileBlock.visible = true;
        fileBlock.position.set(0, 3.2, 0);
        shardPackets.forEach((p) => (p.visible = false));
        streamMaterials.forEach((m) => (m.opacity = 0.15));
        nodeConfigs[2].led.material = new THREE.MeshBasicMaterial({ color: 0x35c98b });
        nodeGGroup.visible = false;
        scanLaser.visible = false;
        archLayersGroup.visible = false;
      }
      // SCENE 02: Data Enters Vault (project.zip descends into core)
      else if (sceneIndex === 1) {
        fileBlock.visible = true;
        const enterT = Math.sin(elapsedTime * 1.5) * 0.5 + 0.5;
        fileBlock.position.set(0, 2.5 - enterT * 1.8, 0);
        shardPackets.forEach((p) => (p.visible = false));
        streamMaterials.forEach((m) => (m.opacity = 0.25));
        scanLaser.visible = false;
        archLayersGroup.visible = false;
      }
      // SCENE 03: Data is Split into 6 Shards (D1-D4, P1-P2)
      else if (sceneIndex === 2) {
        fileBlock.visible = false;
        shardPackets.forEach((packet, idx) => {
          packet.visible = true;
          const node = nodeConfigs[idx];
          // Shards fan out slightly around core
          const dist = 0.8 + Math.sin(elapsedTime * 2 + idx) * 0.1;
          packet.position.set(
            Math.cos(node.angle) * dist,
            0.5,
            Math.sin(node.angle) * dist
          );
        });
        streamMaterials.forEach((m) => (m.opacity = 0.4));
        scanLaser.visible = false;
        archLayersGroup.visible = false;
      }
      // SCENE 04: Parallel Distribution to Nodes A–F
      else if (sceneIndex === 3) {
        fileBlock.visible = false;
        const distT = (elapsedTime * 0.4) % 1.0;
        streamMaterials.forEach((m) => (m.opacity = 0.65));

        shardPackets.forEach((packet, idx) => {
          packet.visible = true;
          const node = nodeConfigs[idx];
          const dist = 0.8 + distT * (radius * 0.88 - 0.8);
          const yArc = Math.sin(distT * Math.PI) * 0.5 + 0.2;
          packet.position.set(
            Math.cos(node.angle) * dist,
            yArc,
            Math.sin(node.angle) * dist
          );
        });
        scanLaser.visible = false;
        archLayersGroup.visible = false;
      }
      // SCENE 05: Node C Failure (Node C powers down, red LED, D3 lost)
      else if (sceneIndex === 4) {
        fileBlock.visible = false;
        // Node C failure state
        nodeConfigs[2].led.material = new THREE.MeshBasicMaterial({ color: 0xe05d6f });
        nodeConfigs[2].light.color.setHex(0xe05d6f);
        nodeConfigs[2].group.position.y = -0.05; // Dropped/downed look

        // Shard D3 disappears, remaining shards stay parked at their nodes
        shardPackets.forEach((p, idx) => {
          if (idx === 2) {
            p.visible = false; // D3 lost
          } else {
            p.visible = true;
            const node = nodeConfigs[idx];
            p.position.set(
              Math.cos(node.angle) * (radius * 0.85),
              0.15,
              Math.sin(node.angle) * (radius * 0.85)
            );
          }
        });
        streamMaterials[2].opacity = 0.05;
        nodeGGroup.visible = false;
        scanLaser.visible = false;
        archLayersGroup.visible = false;
      }
      // SCENE 06: Reconstruction (Galois Field matrix restores D3)
      else if (sceneIndex === 5) {
        fileBlock.visible = false;
        // Surviving shards pulse
        shardPackets.forEach((p, idx) => {
          if (idx === 2) {
            // Synthesizing in center
            p.visible = true;
            p.position.set(0, 0.8 + Math.sin(elapsedTime * 4) * 0.05, 0);
          } else {
            p.visible = true;
          }
        });
        coreLight.intensity = 3.5 + Math.sin(elapsedTime * 6) * 1.5;
        nodeGGroup.visible = false;
        scanLaser.visible = false;
        archLayersGroup.visible = false;
      }
      // SCENE 07: Automatic Repair (Node G online, restored D3 commits)
      else if (sceneIndex === 6) {
        fileBlock.visible = false;
        nodeGGroup.visible = true;
        // Restored D3 enters Node G
        const t = Math.min(1.0, (elapsedTime * 0.5) % 1.0);
        shardPackets[2].visible = true;
        shardPackets[2].position.set(
          t * 3.3,
          0.3 + Math.sin(t * Math.PI) * 0.3,
          t * 1.1
        );
        scanLaser.visible = false;
        archLayersGroup.visible = false;
      }
      // SCENE 08: Cryptographic Integrity Verification (Laser Sweep)
      else if (sceneIndex === 7) {
        fileBlock.visible = true;
        fileBlock.position.set(0, 0.4, 0);
        scanLaser.visible = true;
        scanLaser.position.y = 0.2 + (Math.sin(elapsedTime * 2.5) * 0.5 + 0.5) * 0.4;
        shardPackets.forEach((p) => (p.visible = false));
        archLayersGroup.visible = false;
      }
      // SCENE 09: System Scale (Wide Constellation View)
      else if (sceneIndex === 8) {
        fileBlock.visible = false;
        shardPackets.forEach((p) => (p.visible = false));
        scanLaser.visible = false;
        archLayersGroup.visible = false;
        nodeGGroup.visible = true;
        nodeConfigs.forEach((n) => {
          n.led.material = new THREE.MeshBasicMaterial({
            color: n.isParity ? 0xe6b65c : 0x35c98b,
          });
        });
      }
      // SCENE 10: 3D Architecture Stack
      else if (sceneIndex === 9) {
        fileBlock.visible = false;
        shardPackets.forEach((p) => (p.visible = false));
        scanLaser.visible = false;
        archLayersGroup.visible = true;
        archLayersGroup.rotation.y = elapsedTime * 0.15;
      }
      // SCENE 11: Dashboard Reveal / Final CTA
      else {
        fileBlock.visible = false;
        shardPackets.forEach((p) => (p.visible = false));
        scanLaser.visible = false;
        archLayersGroup.visible = false;
        coreGroup.position.set(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup resources upon unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    >
      {!webGLSupported && (
        <div className="absolute inset-0 bg-[#0B0D10] flex items-center justify-center text-center p-6 font-mono text-xs text-[#9AA3AF]">
          WebGL unavailable. Displaying static cinematic telemetry view.
        </div>
      )}
    </div>
  );
}
