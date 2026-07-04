// eslint-disable-next-line @typescript-eslint/no-require-imports
const media = require("nosleep.js/src/media.js") as { mp4: string; webm: string };

// Tiny silent looping video that prevents iOS screen auto-lock when played.
// NoSleep.js ships these but bypasses them on iOS 16.4+ (where navigator.wakeLock
// exists) — so we import the assets directly and drive the video ourselves.
export const WAKE_MP4 = media.mp4;
export const WAKE_WEBM = media.webm;
