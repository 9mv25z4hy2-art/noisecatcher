# Self-hosted Gun.js Relay (Item 8)

Deploy a single Node.js Gun relay — no database, ~10 lines of code.

## Why

The default peers (`gun-manhattan.herokuapp.com`, `peer.wallie.io`, etc.) are community-run
and may go offline. A self-hosted relay in a privacy-respecting jurisdiction (Iceland/Netherlands)
gives Noisecatcher a stable, auditable relay that you control.

## Recommended hosts

- **Greenhost** (Netherlands) — green energy, GDPR, no US jurisdiction
- **Flokinet** (Iceland) — press freedom focus, strongly privacy-oriented
- **1984 Hosting** (Iceland) — affordable, no surveillance agreements

## Server code

```js
// relay.js — requires: npm install gun express
const Gun = require("gun");
const express = require("express");
const app = express();
const server = app.listen(process.env.PORT || 8765);
Gun({ web: server, file: false }); // file: false — no disk persistence
console.log("Gun relay running on port 8765");
```

```bash
node relay.js
# or with PM2:
pm2 start relay.js --name noisecatcher-relay
```

## Nginx reverse proxy (HTTPS required for browser Gun peers)

```nginx
server {
    server_name relay.noisecatcher.org;
    location / {
        proxy_pass http://localhost:8765;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    # SSL via certbot
}
```

## Configure the app

Set the environment variable before build or in your deployment:

```bash
NEXT_PUBLIC_GUN_PEERS=https://relay.noisecatcher.org/gun
```

`lib/gun.ts` already reads this variable and falls back to public peers if unset.

## Privacy notes

- `file: false` means Gun stores no pin data to disk on the relay — it only forwards
  messages between connected peers.
- Add `proxy_set_header X-Forwarded-For ""` to strip client IPs from relay logs if desired.
- No auth needed — Gun's append-only graph + the client-side schema validator in `lib/sync.ts`
  protect against malformed data.
