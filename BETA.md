# Noisecatcher Beta — Tester Brief
**Version 0.4.0 · Beta send June 2026 · Target release June 30, 2026**

Thank you for testing Noisecatcher. This document tells you what to test, how to report bugs, and what we already know about.

---

## What is Noisecatcher?

A civic noise-monitoring PWA. It measures ambient sound levels in real time using your device microphone, lets you pin readings on a map with GPS + bearing, and gives you vocabulary, thresholds, and advocacy tools to act on what you document.

No account. No server. Everything stays on your device unless you export it.

---

## How to access

URL: _(to be filled before send)_

- **iPhone**: open in **Safari** → Share → Add to Home Screen to install as an app.
- **Android**: open in Chrome → Install prompt should appear, or: three-dot menu → Add to Home Screen.
- **Desktop**: works in Chrome, Firefox, Edge, Safari. Chrome recommended for full PWA support.

---

## Priority test areas

### 1. Microphone & meter
- [ ] Tap **Start Measuring** — does the browser prompt for mic permission?
- [ ] Grant permission — does the gauge come alive and update in real time?
- [ ] Deny permission — does a clear error message appear? (should read: "Microphone access denied. Please allow microphone access in your browser settings…")
- [ ] Meter stabilisation: wait ~3 seconds, does the **● LEVEL** indicator appear?
- [ ] Tap **Stop** — does the gauge freeze and show session stats (peak, avg, samples)?
- [ ] **Calibrate** button (slider icon) — does the modal open? Can you calibrate and close?

### 2. Pin drop
- [ ] While measuring, tap **Pin this reading on map** — does the pin form appear?
- [ ] Select a noise category, add a description, tap Save
- [ ] Navigate to **Map** — is your pin visible, correctly coloured?
- [ ] Tap the pin — does the popup show dB, category, timestamp?
- [ ] Tap **Remove pin** inside the popup — does it disappear?

### 3. Map
- [ ] Does the map load? Does it fly to your location (if GPS granted)?
- [ ] Category filter pills — do they filter pins correctly?
- [ ] Min dB slider — does it hide pins below the threshold?
- [ ] **Density** toggle — does the view switch to heat blobs?
- [ ] **Export GeoJSON** — does a `.geojson` file download?
- [ ] Custom zoom controls (+/−/locate) — do they work?

### 4. Abécédaire
- [ ] Does the full list of 41 entries load?
- [ ] Search: type "acoustic" — are relevant entries returned?
- [ ] Tap a card — does it expand to show definition + context?
- [ ] Category filter (Acoustics / Health / Society…) — works?

### 5. Act
- [ ] Does the page load with the header and all sections?
- [ ] Complaint template — does the text appear?
- [ ] Advocacy search — type your country — are results returned?

### 6. About & Help
- [ ] About page: does it load all sections?
- [ ] Help page: tap each item in the table of contents — does it scroll to that section?
- [ ] Pamphlet page (`/pamphlet`): does it look print-ready? (try Ctrl/Cmd+P)

### 7. Locale / language
- [ ] Tap the **language button** (top-right globe icon) — do language options appear?
- [ ] Switch to French / Arabic / Japanese — does the UI translate?
- [ ] Arabic / Urdu: does the layout flip to right-to-left?

### 8. Light mode
- [ ] Tap the **sun/moon icon** (top-right) — does the theme switch to light?
- [ ] Check all pages in light mode — is text readable? Any black-on-black or white-on-white?

### 9. PWA / offline
- [ ] Install the app to your home screen
- [ ] Turn on Airplane mode → open the app — does it load from cache?
- [ ] Navigate between pages offline — which ones work, which ones don't?

### 10. iOS-specific
- [ ] Safari on iPhone: mic permission flow works?
- [ ] Compass bearing (arrow inside pin dot) — does it point in the right direction?
- [ ] Haptic feedback when level threshold changes — felt or silent?
- [ ] Background behaviour: lock screen while measuring → unlock → is mic still running?

---

## Known limitations (not bugs)

| Item | Notes |
|---|---|
| dB values not calibrated | Smartphone mics vary ±10–15 dB. Use Calibrate to offset. |
| Bearing requires motion permission (iOS) | Tap Allow when prompted |
| No network required | App is fully offline after first load |
| Pins are browser-local | Clearing site data deletes pins — export regularly |
| No multi-device sync | Deliberate. Export GeoJSON to share data. |
| Audio recording saves to device | WebM/Opus — may not play in QuickTime on macOS |

---

## How to report bugs

Please include:
1. **Device + OS + browser** (e.g. iPhone 14 Pro, iOS 17.5, Safari)
2. **Steps to reproduce** — what did you do?
3. **What you expected** vs **what happened**
4. **Screenshot or screen recording** if possible

Send to: _(to be filled before send)_

---

## What we're NOT testing yet

- Server sync / collaborative maps (post-release roadmap)
- External microphone support (works on Android, experimental on iOS)
- Audio recording playback (download works, playback is OS-dependent)

---

## Timeline

| Date | Milestone |
|---|---|
| June 12 | Beta send |
| June 20 | Bug report deadline |
| June 30 | Public release |

---

*Noisecatcher v0.4.0 · Politics of Noise project · Sylvain Souklaye*
