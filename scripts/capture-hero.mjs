// Shoots the hero 3D scene into the pictures the landing shows before (and instead of) WebGL:
// public/images/hero/<lang>-step-<0|1|2>.webp, 900×1000, transparent.
// Needs a running server: BASE_URL=http://localhost:3000 node scripts/capture-hero.mjs
// The page freezes the scroll progress with ?heroP=… (see app/_landing/hero.tsx).
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
// Middle of each step: the form with the amount typed, the profit counted up.
const STEPS = [0.05, 0.6, 0.97];
const OUT = "public/images/hero";

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
try {
  for (const lang of ["ru", "en"]) {
    // Desktop layout: the scene is the right half, 1800 / 2 = 900 wide and 1056 − 56 (header) = 1000 tall.
    const context = await browser.newContext({ viewport: { width: 1800, height: 1056 }, deviceScaleFactor: 1, colorScheme: "dark" });
    await context.addCookies([{ name: "lang", value: lang, url: baseUrl }]);
    for (const [i, p] of STEPS.entries()) {
      // A fresh tab per shot: the software WebGL loop of the previous page slows the next navigation.
      const page = await context.newPage();
      await page.goto(`${baseUrl}/?heroP=${p}`, { waitUntil: "domcontentloaded", timeout: 180_000 });
      const scene = page.locator("[data-hero-scene] canvas");
      await scene.waitFor({ timeout: 60_000 });
      await page.locator("[data-hero-scene] .opacity-100 canvas").waitFor({ timeout: 60_000 });
      await page.waitForTimeout(2500); // counters reach their final value, coins settle
      const dataUrl = await scene.evaluate((canvas) => canvas.toDataURL("image/png"));
      const png = Buffer.from(dataUrl.split(",")[1], "base64");
      const file = `${OUT}/${lang}-step-${i}.webp`;
      const { width, height, size } = await sharp(png).resize(900, 1000, { fit: "cover" }).webp({ quality: 82, alphaQuality: 90 }).toFile(file);
      console.log(`${file}  ${width}×${height}  ${(size / 1024).toFixed(0)} KB`);
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}
