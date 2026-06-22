"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function NeuralBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let hasWebGL = false;
    try {
      const c = document.createElement("canvas");
      hasWebGL = !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
    } catch {
      hasWebGL = false;
    }
    if (!hasWebGL) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 760;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 165);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ---- nodes (the "neurons") ----
    const NODE_COUNT = isMobile ? 46 : 90;
    const SPREAD = 95;
    const nodePositions: THREE.Vector3[] = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * SPREAD * 2,
        (Math.random() - 0.5) * SPREAD * 1.2,
        (Math.random() - 0.5) * SPREAD
      );
      nodePositions.push(v);
    }

    const nodeGeo = new THREE.BufferGeometry();
    const nodeArr = new Float32Array(NODE_COUNT * 3);
    const colorArr = new Float32Array(NODE_COUNT * 3);
    const palette = [
      new THREE.Color(0x67e8f9),
      new THREE.Color(0xc084fc),
      new THREE.Color(0xfb923c),
    ];
    nodePositions.forEach((p, i) => {
      nodeArr[i * 3] = p.x;
      nodeArr[i * 3 + 1] = p.y;
      nodeArr[i * 3 + 2] = p.z;
      const col = palette[i % palette.length];
      colorArr[i * 3] = col.r;
      colorArr[i * 3 + 1] = col.g;
      colorArr[i * 3 + 2] = col.b;
    });
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodeArr, 3));
    nodeGeo.setAttribute("color", new THREE.BufferAttribute(colorArr, 3));

    // soft glow sprite
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = spriteCanvas.height = 64;
    const sctx = spriteCanvas.getContext("2d")!;
    const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.55)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 64, 64);
    const glowTex = new THREE.CanvasTexture(spriteCanvas);

    const nodeMat = new THREE.PointsMaterial({
      size: 4.4,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(nodeGeo, nodeMat);

    const group = new THREE.Group();
    group.add(points);

    // ---- synapses (connect each node to its nearest couple of neighbors) ----
    const linePositions: number[] = [];
    const K = 2;
    for (let i = 0; i < nodePositions.length; i++) {
      const distances = nodePositions
        .map((p, j) => ({ j, d: i === j ? Infinity : p.distanceTo(nodePositions[i]) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, K);
      distances.forEach(({ j, d }) => {
        if (d < SPREAD * 0.6) {
          const a = nodePositions[i];
          const b = nodePositions[j];
          linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      });
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6b6f9e,
      transparent: true,
      opacity: 0.18,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    scene.add(group);

    // ---- interaction ----
    let targetRotX = 0;
    let targetRotY = 0;
    let curRotX = 0;
    let curRotY = 0;

    function onMouseMove(e: MouseEvent) {
      const rect = mount!.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetRotY = nx * 0.35;
      targetRotX = ny * 0.2;
    }
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    function onResize() {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    let raf = 0;
    const clock = new THREE.Clock();
    function animate() {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!reducedMotion) {
        curRotX += (targetRotX - curRotX) * 0.04;
        curRotY += (targetRotY - curRotY) * 0.04;
        group.rotation.x = curRotX + Math.sin(t * 0.06) * 0.05;
        group.rotation.y = curRotY + t * 0.035;
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      nodeGeo.dispose();
      lineGeo.dispose();
      nodeMat.dispose();
      lineMat.dispose();
      glowTex.dispose();
      renderer.dispose();
      if (mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
    />
  );
}
