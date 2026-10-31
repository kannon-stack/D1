// Anchor-landing check (R2-01): every in-page link and direct hash load, at 375 and 1280, smooth and
// reduced motion; each target section must land 64 px (±4) under the top. Server on :3100 first:
//   NODE_PATH=$(npm root -g) node studio-projects/northbound/site/scripts/check-anchors.mjs
import { loadPlaywright, launchBrowser } from "../../../../.claude/studio-tools/lib/common.mjs";
const pw = loadPlaywright();
const base = "http://localhost:3100/";
const browser = await launchBrowser(pw, base);
let fails = 0;
const rows = [];

async function settle(page) {
  let last = -1, same = 0;
  for (let i = 0; i < 80; i++) {
    const y = await page.evaluate(() => scrollY);
    if (y === last) { if (++same >= 4) break; } else same = 0;
    last = y;
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(150);
}
async function check(page, label, id, ctx) {
  await settle(page);
  const top = await page.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top), id);
  const ok = Math.abs(top - 64) <= 4;
  if (!ok) fails++;
  rows.push(`${ok ? "ok  " : "FAIL"} ${ctx.padEnd(13)} ${label.padEnd(26)} #${id.padEnd(13)} top=${top}`);
}

for (const width of [375, 1280]) {
  for (const motion of ["no-preference", "reduce"]) {
    const ctx = `${width}/${motion === "reduce" ? "reduced" : "smooth"}`;
    const context = await browser.newContext({ viewport: { width, height: width < 768 ? 812 : 800 }, reducedMotion: motion });
    const page = await context.newPage();
    const fresh = async () => {
      await page.goto(base, { waitUntil: "networkidle" });
      await page.waitForTimeout(300);
    };
    // nav links
    for (const id of ["roasts", "roast-curve", "how-it-works", "subscribe"]) {
      await fresh();
      if (width >= 1024) await page.locator(`header a.nav-link[href="/#${id}"]`).click();
      else {
        await page.getByRole("button", { name: "Menu" }).click();
        await page.locator(`#menu li a[href="/#${id}"]`).click();
      }
      await check(page, `nav ${id}`, id, ctx);
    }
    // CTAs
    const ctas = [
      ["hero CTA", "#top a.btn[href='#subscribe']", "subscribe"],
      ["hero secondary", "#top a[href='#roasts']", "roasts"],
      ["route card link", "#top a[href='#roast-curve']", "roast-curve"],
      ["roasts CTA", "#roasts a.btn[href='#subscribe']", "subscribe"],
      ["route CTA", ".route-panel a.btn[href='#subscribe']", "subscribe"],
    ];
    for (const [label, sel, id] of ctas) {
      await fresh();
      await page.locator(sel).scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.locator(sel).click();
      await check(page, label, id, ctx);
    }
    // footer links
    for (const id of ["roasts", "how-it-works", "subscribe"]) {
      await fresh();
      const sel = `footer a[href="/#${id}"]`;
      await page.locator(sel).scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.locator(sel).click();
      await check(page, `footer ${id}`, id, ctx);
    }
    // direct hash loads
    for (const id of ["subscribe", "how-it-works"]) {
      await page.goto(base + "#" + id, { waitUntil: "networkidle" });
      await check(page, `direct /#${id}`, id, ctx);
    }
    await context.close();
  }
}
console.log(rows.join("\n"));
console.log(fails ? `${fails} FAILED` : "all anchors land at 64 ±4 px");
process.exitCode = fails ? 1 : 0;
await browser.close();
