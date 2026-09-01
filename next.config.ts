import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    // Shared CSP directives (everything except frame-ancestors, which differs
    // between the app shell and the embeddable widget).
    // worker-src 'self' blob: — required by MapLibre GL JS (spawns Web Workers from blob: URLs)
    const baseCsp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.openstreetmap.org https://*.openfreemap.org https://*.tile.openstreetmap.org",
      // tfhub.dev + storage.googleapis.com: YAMNet model fetch (loadGraphModel redirects through GCS)
      // wss://gun.eco and wss://gun.o8.is (apex) must be listed explicitly — wss://*.gun.eco only matches subdomains
      "connect-src 'self' https://*.openfreemap.org https://*.openstreetmap.org https://nominatim.openstreetmap.org https://gun.eco https://gun.o8.is wss://gun.eco wss://*.gun.eco wss://gun.o8.is wss://*.o8.is https://tfhub.dev https://storage.googleapis.com",
      "worker-src 'self' blob:",
      // blob: required for voice note playback (WAV blob URLs created via URL.createObjectURL)
      "media-src 'self' blob:",
    ];

    return [
      {
        // App shell — everything except the embeddable widget. Clickjacking-proof.
        source: "/((?!embed\\.html).*)",
        headers: [
          { key: "Content-Security-Policy", value: [...baseCsp, "frame-ancestors 'none'"].join("; ") },
        ],
      },
      {
        // Embeddable widget — allowed to be framed by any site (it is a public,
        // read-only microphone meter with no app data or auth).
        source: "/embed.html",
        headers: [
          { key: "Content-Security-Policy", value: [...baseCsp, "frame-ancestors *"].join("; ") },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(nextConfig);
