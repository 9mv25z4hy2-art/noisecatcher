# Building the Noisecatcher Android app (APK / AAB)

Noisecatcher is a PWA, so the Android app is a **TWA** (Trusted Web Activity):
a thin native shell that runs the live `noisecatcher.org` site full-screen, with
microphone and location working exactly as in the browser. There is **no separate
codebase to maintain** — the app always serves the deployed site.

The PWA is already TWA-ready: valid `manifest.json` (name, `id`, `scope`,
`standalone`, 192/512/512-maskable icons, `theme_color`), a service worker, and
HTTPS.

---

## Option A — PWABuilder (recommended, no local toolchain)

This produces a **signed APK + AAB** (for the Play Store) in the cloud.

1. Go to **https://www.pwabuilder.com** and enter `https://noisecatcher.org`.
2. Review the report (it will pass — manifest + SW + HTTPS are in place).
3. Click **Package for stores → Android**.
4. Options that matter:
   - **Package ID**: `org.noisecatcher.twa` (must match `assetlinks.json`, see below).
   - **App name**: Noisecatcher
   - Signing key: let PWABuilder **generate** a new signing key, and
     **download and keep the `.keystore` + passwords** — you need the same key
     for every future update.
5. Download the zip. It contains `app-release-signed.apk` (sideload/test) and
   `app-release-bundle.aab` (upload to Play Console), plus an
   **`assetlinks.json`** and the signing key's SHA-256 fingerprint.

### Finish Digital Asset Links (removes the URL bar)

The TWA only runs chrome-less once the site proves it owns the app:

1. Open the `assetlinks.json` PWABuilder produced (or copy the SHA-256 it shows).
2. Paste that fingerprint into **`public/.well-known/assetlinks.json`** in this
   repo, replacing `REPLACE_WITH_YOUR_APP_SIGNING_SHA256_FINGERPRINT`. Keep
   `package_name` equal to the Package ID you used.
3. Commit + deploy. Verify it is live and public:
   `curl https://noisecatcher.org/.well-known/assetlinks.json`
4. Reinstall the app — the address bar should be gone.

> If you enable Play App Signing, add **both** fingerprints (your upload key
> and Google's app-signing key) to the `sha256_cert_fingerprints` array.

---

## Option B — Bubblewrap (local build)

Needs a local toolchain that is **not** installed in this repo's environment:
- JDK 17, Android SDK + build-tools, and Gradle.

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://noisecatcher.org/manifest.json
# answer prompts: package id org.noisecatcher.twa, generate a signing key
bubblewrap build          # -> app-release-signed.apk + .aab
```

Then do the same **Digital Asset Links** step above with the fingerprint from:

```bash
keytool -list -v -keystore android.keystore -alias <alias> | grep SHA256
```

---

## Notes / limits (honest)

- A TWA is Chrome-on-Android under the hood, so mic/GPS behave as on the web.
  The iOS-only recording quirks do **not** apply here.
- A TWA **cannot** provide an Android home-screen **widget** — widgets are native
  (`AppWidgetProvider`, Kotlin) and would be a separate project. See the widget
  discussion; the web-embeddable widget lives at `/embed.html`.
- Keep the signing keystore safe and backed up: losing it means you can't ship
  updates under the same app listing.
