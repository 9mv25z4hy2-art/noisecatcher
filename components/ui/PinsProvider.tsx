"use client";

import { useEffect } from "react";
import { migrateLegacyPins } from "@/lib/db";

export default function PinsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // One-time migration from localStorage → IndexedDB (no-op if already done)
    migrateLegacyPins().catch(() => {});
  }, []);

  return <>{children}</>;
}
