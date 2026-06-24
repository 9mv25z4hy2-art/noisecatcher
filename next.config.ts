import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // worker-src 'self' blob: — required by MapLibre GL JS (spawns Web Workers from blob: URLs)
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.openstreetmap.org https://*.openfreemap.org https://*.tile.openstreetmap.org",
              // tfhub.dev + storage.googleapis.com: YAMNet model fetch (loadGraphModel redirects through GCS)
              "connect-src 'self' https://*.openfreemap.org https://*.openstreetmap.org https://nominatim.openstreetmap.org https://gun.eco https://gun.o8.is wss://*.gun.eco wss://*.o8.is https://tfhub.dev https://storage.googleapis.com",
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(nextConfig);
