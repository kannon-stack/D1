// Anchor-landing check: every in-page link and every direct /#id load, at 375 and 1280, in smooth
// and reduced-motion modes. The nav is static, so #build, #process and #contact must land 24 px
// (±4) under the top of the viewport, and #top (scroll-margin = the nav height, R1-05) must bring
// the page back to scrollY 0 (±4) with the whole nav visible. Serve the export on :3100 first:
//
//   node .claude/studio-tools/scripts/serve.mjs start --dir studio-projects/agkbuilds/site
//   node studio-projects/agkbuilds/site/scripts/check-anchors.mjs
import { loadPlaywright, launchBrowser } from "../../../../.claude/studio-tools/lib/common.mjs";

const pw = loadPlaywright();
const base = "http://localhost:3100/";
const EXPECT = 24;
const browser = await launchBrowser(pw, base);
let fails = 0;
const rows = [];

async function settle(page) {
  let last = -1,
    same = 0;
  for (let i = 0; i < 80; i++) {
    const y = await page.evaluate(() => scrollY);
    if (y === last) {
      if (++same >= 4) break;
    } else same = 0;
    last = y;
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(150);
}
async function check(page, label, id, ctx) {
  await settle(page);
  const { top, y } = await page.evaluate(
    (id) => ({ top: Math.round(document.getElementById(id).getBoundingClientRect().top), y: Math.round(scrollY) }),
    id,
  );
  const ok = id === "top" ? Math.abs(y) <= 4 : Math.abs(top - EXPECT) <= 4;
  if (!ok) fails++;
  rows.push(`${ok ? "ok  " : "FAIL"} ${ctx.padEnd(13)} ${label.padEnd(28)} #${id.padEnd(9)} top=${top} scrollY=${y}`);
}

for (const width of [375, 1280]) {
  for (const motion of ["no-preference", "reduce"]) {
    const ctx = `${width}/${motion === "reduce" ? "reduced" : "smooth"}`;
    const context = await browser.newContext({ viewport: { width, height: width < 768 ? 812 : 800 }, reducedMotion: motion });
    const page = await context.newPage();
    const fresh = async (scrollTo) => {
      await page.goto(base, { waitUntil: "networkidle" });
      await page.waitForTimeout(300);
      if (scrollTo) {
        await page.locator(scrollTo).scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
      }
    };
    const links = [
      // [label, selector, target, start scrolled to the link?]
      ...(width >= 1024
        ? [
            ["nav 02 build", 'header nav a[href="#build"]', "build"],
            ["nav 03 process", 'header nav a[href="#process"]', "process"],
          ]
        : []),
      ["nav 04 contact", 'header nav a[href="#contact"]', "contact"],
      ["footer wordmark", 'footer a[href="#top"].wordmark', "top", true],
      ["footer back to top", 'footer a.nav-link[href="#top"]', "top", true],
      ["nav wordmark (from contact)", 'header a[href="#top"]', "top", "contact"],
    ];
    for (const [label, sel, id, scrolled] of links) {
      if (scrolled === "contact") {
        await page.goto(base + "#contact", { waitUntil: "networkidle" });
        await settle(page);
        await page.evaluate(() => scrollTo(0, 0)); // header is static: bring it back into view
        await page.waitForTimeout(200);
      } else await fresh(scrolled ? sel : null);
      await page.locator(sel).click();
      await check(page, label, id, ctx);
    }
    for (const id of ["top", "build", "process", "contact"]) {
      await page.goto(base + "#" + id, { waitUntil: "networkidle" });
      await check(page, `direct /#${id}`, id, ctx);
    }
    await context.close();
  }
}
console.log(rows.join("\n"));
console.log(fails ? `${fails} FAILED` : `all anchors land: sections at ${EXPECT} ±4 px, #top at scrollY 0 ±4`);
process.exitCode = fails ? 1 : 0;
await browser.close();
