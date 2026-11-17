// Shoots the hero 3D scene into the pictures the landing shows before (and instead of) WebGL:
// public/images/hero/v2/<lang>-d-step-<0|1|2>.webp (computer, 900×1000) and <lang>-m-step-<0|1|2>.webp (phone layout
// below 900 px, 800×842), transparent.
// Needs a running server: BASE_URL=http://localhost:3000 node scripts/capture-hero.mjs
// The page freezes the scroll progress with ?heroP=… (see app/_landing/hero.tsx).
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
// Step 0 at the very top (where the live scene starts), then the middle of steps 1 and 2.
const STEPS = [0, 0.6, 0.97];
// Versioned folder: a new set never collides with images cached under the old URLs (Next, Vercel, browsers).
const OUT = "public/images/hero/v2";

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
try {
// Computer: the scene is the right half, 1800 / 2 = 900 wide and 1072 − 72 (landing header) = 1000 tall.
// Phone layout: the scene is the full width and 52% of the sticky block: 800 × 0.52 × (1683 − 64) = 842.
const FRAMES = [
  { suffix: "d-", viewport: { width: 1800, height: 1072 }, size: [900, 1000] },
  { suffix: "m-", viewport: { width: 800, height: 1683 }, size: [800, 842] },
];

  for (const lang of ["ru", "en"]) for (const frame of FRAMES) {
    const context = await browser.newContext({ viewport: frame.viewport, deviceScaleFactor: 1, colorScheme: "dark" });
    await context.addCookies([{ name: "lang", value: lang, url: baseUrl }]);
    for (const [i, p] of STEPS.entries()) {
      // A fresh tab per shot: the software WebGL loop of the previous page slows the next navigation.
      const page = await context.newPage();
      await page.goto(`${baseUrl}/?heroP=${p}`, { waitUntil: "domcontentloaded", timeout: 180_000 });
      const scene = page.locator("[data-hero-scene] canvas");
      await scene.waitFor({ timeout: 60_000 });
      await page.locator("[data-hero-scene] .opacity-100 canvas").waitFor({ timeout: 60_000 });
      await page.waitForTimeout(3500); // counters reach their final value, the coins model loads and settles
      const dataUrl = await scene.evaluate((canvas) => canvas.toDataURL("image/png"));
      const png = Buffer.from(dataUrl.split(",")[1], "base64");
      const file = `${OUT}/${lang}-${frame.suffix}step-${i}.webp`;
      const { width, height, size } = await sharp(png).resize(frame.size[0], frame.size[1], { fit: "cover" }).webp({ quality: 82, alphaQuality: 90 }).toFile(file);
      console.log(`${file}  ${width}×${height}  ${(size / 1024).toFixed(0)} KB`);
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}
