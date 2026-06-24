// Noisecatcher Gun.js relay
// Deploy: npm install gun express && node server.js
// Or:     pm2 start server.js --name noisecatcher-relay
// Env:    PORT (default 8765)

const Gun = require("gun");
const express = require("express");

const app = express();

// ── Rate limiting ──────────────────────────────────────────────────────────────
// Simple in-process token-bucket per IP. No external dependency.
// Allows 60 requests/minute per IP using a sliding-window counter.
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 60;
const ipCounters = new Map(); // ip → { count, windowStart }

function rateLimiter(req, res, next) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() ?? req.socket.remoteAddress ?? "unknown";
  const now = Date.now();
  const entry = ipCounters.get(ip);

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    ipCounters.set(ip, { count: 1, windowStart: now });
    return next();
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) {
    return res.status(429).json({ error: "Too many requests. Retry after 60 s." });
  }
  next();
}

// Clean up stale IP entries every 5 minutes to prevent unbounded growth.
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS * 2;
  for (const [ip, entry] of ipCounters) {
    if (entry.windowStart < cutoff) ipCounters.delete(ip);
  }
}, 5 * 60_000);

app.use(rateLimiter);

// Health check for Railway / uptime monitors
app.get("/", (_req, res) => res.json({ ok: true, service: "noisecatcher-relay" }));

// ── Write-size guard ───────────────────────────────────────────────────────────
// Gun sends PUT payloads as JSON. Reject bodies over 64 KB to prevent
// the relay being used as a free message store for arbitrary data.
app.use(express.json({ limit: "64kb" }));

// ── Allowed key prefix guard ───────────────────────────────────────────────────
// Only relay writes to known Noisecatcher graph keys.
// Gun encodes the target node key in the PUT body under the "put" property.
// Any write to an unrecognised key prefix is silently dropped.
const ALLOWED_PREFIXES = ["noisecatcher/"];

app.put("/gun", (req, res, next) => {
  const put = req.body?.put;
  if (put && typeof put === "object") {
    const keys = Object.keys(put);
    const anyUnknown = keys.some((k) => !ALLOWED_PREFIXES.some((p) => k.startsWith(p)));
    if (anyUnknown) {
      return res.status(403).json({ error: "Key prefix not permitted." });
    }
  }
  next();
});

const server = app.listen(process.env.PORT || 8765, () => {
  console.log(`Gun relay listening on port ${process.env.PORT || 8765}`);
});

// file: false — no disk persistence; relay only forwards between peers
Gun({ web: server, file: false });
