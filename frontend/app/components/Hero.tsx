"use client";

import { useEffect, useState } from "react";
import ScrollyCanvas from "./ScrollyCanvas";
import Overlay from "./Overlay";
import { api, Stats } from "../lib/api";

export default function Hero() {
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api
      .stats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <ScrollyCanvas onProgress={setProgress}>
      <Overlay
        progress={progress}
        totalQuestions={stats?.total_questions}
        totalCategories={stats?.total_categories}
      />
    </ScrollyCanvas>
  );
}
