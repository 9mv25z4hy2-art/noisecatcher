import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/poster-exports');
mkdirSync(OUT, { recursive: true });

const URL = 'https://noisecatcher.vercel.app/posters.html';

const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage();

// 1080×1080 viewport — Instagram square
await page.setViewportSize({ width: 1080, height: 1080 });
await page.goto(URL, { waitUntil: 'networkidle' });

// Wait for IBM Plex Mono to load
await page.waitForTimeout(1500);

const cards = await page.$$('.card');
console.log(`Found ${cards.length} cards`);

for (let i = 0; i < cards.length; i++) {
  const card = cards[i];
  const n = String(i + 1).padStart(2, '0');
  const path = join(OUT, `noisecatcher-poster-${n}.jpg`);

  await card.screenshot({
    path,
    type: 'jpeg',
    quality: 95,
  });
  console.log(`✓ poster-${n}.jpg`);
}

await browser.close();
console.log(`\nDone — ${cards.length} JPEGs saved to public/poster-exports/`);
