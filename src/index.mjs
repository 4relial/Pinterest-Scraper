import { chromium } from "playwright";

/**
 * @typedef {Object} SearchOptions
 * @property {string=} path - path executable browser (Brave/Chrome/Edge).
 * @property {number=} minAddPerLoop
 * @property {number=} maxLoops
 * @property {number=} idleWait
 * @property {number=} scrollChunk
 * @property {boolean=} headless
 * @property {string=} userAgent
 * @property {{width:number,height:number}=} viewport
 * @property {string=} locale
 */

/**
 * Pinterest image search using Playwright.
 * Returns array of cleaned pin image URLs (736x).
 * @param {string} q
 * @param {SearchOptions} [opts]
 * @returns {Promise<string[]>}
 */
export async function search(q, opts = {}) {
  const {
    path,
    minAddPerLoop = 20,
    maxLoops = 60,
    idleWait = 1200,
    scrollChunk = 3000,
    headless = true,
    userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    viewport = { width: 1280, height: 900 },
    locale = "id-ID"
  } = opts;

  const browser = await chromium.launch({
    executablePath: path || undefined,
    headless,
    args: ["--disable-gpu","--no-sandbox","--disable-dev-shm-usage","--headless=new"]
  });

  const ctx = await browser.newContext({ locale, userAgent, viewport });
  const page = await ctx.newPage();

  try {
    await page.goto("https://www.pinterest.com/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.goto(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector('img[src*="i.pinimg.com"]', { timeout: 15000 }).catch(() => {});

    const collect = async () => {
      return await page.$$eval('img[src*="i.pinimg.com"]', (els) => {
        const out = new Set();
        const bestFromSrcset = (s) => {
          if (!s) return null;
          const c = s.split(",").map(x => x.trim().split(" ")[0]).filter(Boolean);
          return c.at(-1) || null;
        };
        for (const el of els) {
          const srcset = el.getAttribute("srcset");
          const raw = bestFromSrcset(srcset) || el.getAttribute("src") || "";
          if (!raw) continue;
          if (!raw.startsWith("https://i.pinimg.com/")) continue;

          if (raw.includes("/60x60/") || raw.includes("/30x30/") || raw.includes("/120x120/")) continue;

          const w = el.naturalWidth || 0;
          const h = el.naturalHeight || 0;
          if (w && h && (w < 200 || h < 200)) continue;

          let url = raw.replace(/\/\d{2,3}x\//, "/736x/");
          out.add(url);
        }
        return [...out];
      });
    };

    const seen = new Set();
    let stableRounds = 0;

    for (let i = 0; i < maxLoops; i++) {
      await page.evaluate(({ scrollChunk }) => window.scrollBy(0, scrollChunk), { scrollChunk });

      await page.waitForLoadState("networkidle", { timeout: idleWait }).catch(() => {});
      await page.waitForTimeout(350);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(350);

      const batch = await collect();
      let added = 0;
      for (const u of batch) {
        if (!seen.has(u)) {
          seen.add(u);
          added++;
        }
      }

      const more = await page.$('button:has-text("Show more"), button[aria-label*="More"], div[role="button"]:has(svg)');
      if (more) {
        try { await more.click({ timeout: 1000 }); await page.waitForTimeout(600); } catch {}
      }

      if (added >= minAddPerLoop) {
        stableRounds = 0;
      } else {
        stableRounds++;
        if (stableRounds >= 3) break;
      }
    }

    return Array.from(seen);
  } finally {
    await browser.close();
  }
}

export default search;
