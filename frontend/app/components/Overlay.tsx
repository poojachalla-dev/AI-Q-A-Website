"use client";

import Link from "next/link";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

// remap progress within [from, to] to a 0-1 local range, clamped
function stage(progress: number, from: number, to: number) {
  if (to === from) return progress >= to ? 1 : 0;
  return Math.max(0, Math.min(1, (progress - from) / (to - from)));
}

export default function Overlay({
  progress,
  totalQuestions,
  totalCategories,
}: {
  progress: number;
  totalQuestions?: number;
  totalCategories?: number;
}) {
  // three beats: 0% center, 30% left, 60% right, then hold + reveal CTA
  const beatA = 1 - stage(progress, 0, 0.16); // fades out 0 -> 0.16
  const beatBIn = stage(progress, 0.18, 0.3);
  const beatBOut = 1 - stage(progress, 0.42, 0.5);
  const beatB = Math.min(beatBIn, beatBOut);
  const beatCIn = stage(progress, 0.52, 0.62);
  const beatC = beatCIn;
  const ctaIn = stage(progress, 0.88, 0.98);

  const shiftA = lerp(0, 0, 1); // stays centered
  const shiftB = lerp(40, -60, stage(progress, 0.18, 0.42)); // drifts further left
  const shiftC = lerp(60, 0, stage(progress, 0.52, 0.72)); // settles toward center-right

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      {/* Beat A — centered intro */}
      <div
        style={{
          position: "absolute",
          opacity: beatA,
          transform: `translateY(${lerp(0, -14, 1 - beatA)}px)`,
          maxWidth: 720,
          padding: "0 24px",
        }}
      >
        <p className="eyebrow" style={{ justifyContent: "center", marginBottom: 20 }}>
          The knowledge graph, rendered
        </p>
        <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4.6rem)", fontWeight: 700 }}>
          Every AI &amp; ML concept,
          <br />
          one constellation.
        </h1>
      </div>

      {/* Beat B — drifts left, breadth stat */}
      <div
        style={{
          position: "absolute",
          opacity: beatB,
          transform: `translateX(${shiftB}px)`,
          maxWidth: 520,
          padding: "0 24px",
        }}
      >
        <p className="eyebrow" style={{ justifyContent: "center", marginBottom: 18 }}>
          {totalCategories ?? 12} domains, mapped
        </p>
        <h2 style={{ fontSize: "clamp(1.9rem, 4.6vw, 3.2rem)", fontWeight: 700 }}>
          {totalQuestions ?? "100+"} questions.
          <br />
          Zero scattered tabs.
        </h2>
      </div>

      {/* Beat C — settles right-of-center, practice hook */}
      <div
        style={{
          position: "absolute",
          opacity: beatC,
          transform: `translateX(${shiftC}px)`,
          maxWidth: 520,
          padding: "0 24px",
        }}
      >
        <p className="eyebrow" style={{ justifyContent: "center", marginBottom: 18 }}>
          Then, drill it in
        </p>
        <h2 style={{ fontSize: "clamp(1.9rem, 4.6vw, 3.2rem)", fontWeight: 700 }}>
          A practice mode
          <br />
          built to stick.
        </h2>
      </div>

      {/* CTA — appears once the sequence settles */}
      <div
        style={{
          position: "absolute",
          bottom: "10vh",
          opacity: ctaIn,
          transform: `translateY(${lerp(20, 0, ctaIn)}px)`,
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          justifyContent: "center",
          pointerEvents: ctaIn > 0.5 ? "auto" : "none",
        }}
      >
        <Link href="/topics" className="btn primary">
          Enter the constellation →
        </Link>
        <Link href="/practice" className="btn">
          Start practice mode
        </Link>
      </div>
    </div>
  );
}
