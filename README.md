# @4relial/pinterest-search (unofficial)

Import-only **Playwright** helper to collect **Pinterest** image URLs from search results.  
Dual export **ESM** + **CJS** + **.d.ts**. **No server/CLI included.**

> ⚠️ Follow Pinterest’s terms and usage policies. Use responsibly.

## Installation
```bash
npm i github:4relial/Pinterest-Scraper

# Playwright as a peer dependency
npm i -D playwright 
npx playwright install chromium
```

## Usage (ESM)
```js
import { search } from "@4relial/pinterest-search";

const urls = await search("kamisato ayaka", {
  // path: browser to Chromium/Chrome/Brave (Optional)
  maxLoops: 5,
  minAddPerLoop: 10
});
console.log(urls);
```

## Usage (CommonJS)
```js
const { search } = require("@4relial/pinterest-search");

search("kamisato ayaka", { maxLoops: 5, minAddPerLoop: 10 })
  .then(console.log)
  .catch(console.error);
```
## Options `search(query, options?)`
- `path?: string` — run via Chrome executable. **Leave empty** to use Chromium installed by `npx playwright install`.
- `minAddPerLoop = 20`
- `maxLoops = 60`
- `idleWait = 1200` (ms)
- `scrollChunk = 3000` (px)
- `headless = true`
- `userAgent?: string`
- `locale = 'id-ID'`
- `viewport = { width: 1280, height: 900 }`

## Browser Path Examples
### Windows
- Brave: `C:\Program Files\Google\Chrome\Application\brave.exe`
- Chrome: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Edge: `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`

### Linux
- Brave: `/usr/bin/brave-browser` or `/opt/brave.com/brave/brave`
- Chrome: `/usr/bin/google-chrome` or `/opt/google/chrome/chrome`

### macOS
- Brave: `/Applications/Brave Browser.app/Contents/MacOS/Brave Browser`
- Chrome: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`

> If `path` is not provided, Playwright will use **Chromium** installed via `npx playwright install chromium`.

## Tips
- Pinterest sometimes delays resource loading — increase `maxLoops` or raise `idleWait`.
- Run **non-headless** for debugging: `headless: false`.
- Add **proxy** via Playwright/OS env if needed (e.g., IP rate-limit).
- For stability, add small delays between loops and use a `Set` collection (already used in this lib).

## Legal
This package is **not affiliated** with Pinterest. Use only for lawful purposes and in compliance with local terms.
