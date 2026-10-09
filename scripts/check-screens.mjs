// Screenshots pages at 6 widths in light and dark theme and fails if any page scrolls horizontally.
// Usage: node scripts/check-screens.mjs [/path ...]
// BASE_URL=http://localhost:3000 uses an already running server;
// otherwise a temporary `next dev` is started and stopped afterwards.
import { spawn, execSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const WIDTHS = [360, 390, 768, 1024, 1440, 1920];
// The app follows the system theme by default, so the browser colour scheme switches it.
const THEMES = ["light", "dark"];
const HEIGHT = 900;
const PORT = 3100;
const OUT_DIR = ".screenshots";

const paths = process.argv.length > 2 ? process.argv.slice(2) : ["/"];
let baseUrl = process.env.BASE_URL;
let server;

async function waitForServer(url, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server did not start at ${url}`);
}

function stopServer() {
  if (!server) return;
  if (process.platform === "win32") {
    try {
      execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: "ignore" });
    } catch {}
  } else {
    process.kill(-server.pid, "SIGTERM");
  }
}

if (!baseUrl) {
  baseUrl = `http://localhost:${PORT}`;
  server = spawn(`npx next dev -p ${PORT}`, {
    shell: true,
    detached: process.platform !== "win32",
    stdio: "ignore",
  });
  console.log(`Starting next dev on ${baseUrl} ...`);
}

const failures = [];
try {
  await waitForServer(baseUrl);
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const path of paths) {
    const slug = path === "/" ? "home" : path.replace(/^\/|\/$/g, "").replace(/\//g, "_");
    for (const theme of THEMES) for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: HEIGHT }, colorScheme: theme });
      await page.goto(baseUrl + path, { waitUntil: "networkidle" });
      // Charts measure their container and animate after load; give them a moment.
      await page.waitForTimeout(1000);
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      const file = `${OUT_DIR}/${slug}-${theme}-${width}.png`;
      await page.screenshot({ path: file, fullPage: true });
      await page.close();

      const ok = scrollWidth <= innerWidth;
      if (!ok) failures.push(`${path} @ ${width}px ${theme}`);
      console.log(
        `${ok ? "OK  " : "FAIL"} ${path} @ ${width}px ${theme.padEnd(5)}  ` +
          (ok ? "no horizontal scroll" : `horizontal scroll: ${scrollWidth}px > ${innerWidth}px`) +
          `  -> ${file}`,
      );
    }
  }
  await browser.close();
} finally {
  stopServer();
}

if (failures.length) {
  console.log(`\nHorizontal scroll found: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("\nAll widths passed.");
