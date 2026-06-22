"use client";

import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 64;
const FRAME_PATH = (i: number) => `/sequence/frame-${String(i).padStart(3, "0")}.webp`;

export default function ScrollyCanvas({
  children,
  onProgress,
}: {
  children?: React.ReactNode;
  onProgress?: (progress: number) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // preload the sequence
  useEffect(() => {
    let cancelled = false;
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => {
        loadedCount++;
        if (!cancelled) setLoadProgress(loadedCount / FRAME_COUNT);
        if (loadedCount === FRAME_COUNT && !cancelled) setLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT && !cancelled) setLoaded(true);
      };
      images.push(img);
    }
    imagesRef.current = images;

    return () => {
      cancelled = true;
    };
  }, []);

  // draw the current frame, object-fit: cover style
  function drawFrame(index: number) {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = cw / ch;
    let drawW: number, drawH: number, offsetX: number, offsetY: number;

    if (imgRatio > boxRatio) {
      drawH = ch;
      drawW = ch * imgRatio;
      offsetX = (cw - drawW) / 2;
      offsetY = 0;
    } else {
      drawW = cw;
      drawH = cw / imgRatio;
      offsetX = 0;
      offsetY = (ch - drawH) / 2;
    }
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  // scroll -> frame index (rAF-throttled so we never do more than one
  // canvas draw + state update per animation frame)
  useEffect(() => {
    let ticking = false;

    function update() {
      ticking = false;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const total = wrapper.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const progress = total > 0 ? scrolled / total : 0;

      const frame = Math.min(
        FRAME_COUNT - 1,
        Math.floor(progress * (FRAME_COUNT - 1))
      );
      frameRef.current = frame;
      drawFrame(frame);
      onProgress?.(progress);
    }

    function onScrollOrResize() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    update();

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // redraw once loaded so the first frame actually appears
  useEffect(() => {
    if (loaded) drawFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  return (
    <div ref={wrapperRef} style={{ position: "relative", height: "500vh" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          background: "var(--void)",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />

        {!loaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              background: "var(--void)",
            }}
          >
            <div
              className="mono"
              style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--mist-dim)" }}
            >
              ASSEMBLING THE CONSTELLATION… {Math.round(loadProgress * 100)}%
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
