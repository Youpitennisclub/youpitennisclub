"""Partner bubble (Wellhub + Urban Sports Club) must stay fully visible on
Safari iOS (WebKit) and Chrome Android (Chromium): portrait, landscape,
zoom, and viewport changes (address bar / virtual keyboard).

Run: python3 tests/visual/test_partner_bubble.py  (dev server on :8080)
"""
import asyncio, sys
from pathlib import Path
from playwright.async_api import async_playwright

URL = "http://localhost:8080/"
OUT = Path("/tmp/browser/partner-bubble-tests"); OUT.mkdir(parents=True, exist_ok=True)
MIN_MARGIN = 8  # px from screen edge
DEVICES = [("webkit", "iPhone 14"), ("webkit", "iPad (gen 7)"),
           ("chromium", "Pixel 7"), ("chromium", "Galaxy Tab S4")]
failures = []

async def check(page, label):
    bubble = page.locator("article", has=page.get_by_alt_text("Wellhub")).first
    await bubble.scroll_into_view_if_needed()
    box = await bubble.bounding_box()
    vw = await page.evaluate("window.visualViewport ? visualViewport.width : innerWidth")
    sw = await page.evaluate("document.documentElement.scrollWidth")
    cw = await page.evaluate("document.documentElement.clientWidth")
    ok = box and box["x"] >= MIN_MARGIN and box["x"] + box["width"] <= cw - MIN_MARGIN and sw <= cw
    await bubble.screenshot(path=str(OUT / f"{label}.png"))
    print(("PASS " if ok else "FAIL ") + label, box, f"vw={vw} cw={cw} sw={sw}")
    if not ok: failures.append(label)

async def run(p, engine, name):
    dev = p.devices[name]
    browser = await getattr(p, engine).launch(headless=True)
    tag = name.replace(" ", "_").replace("(", "").replace(")", "")
    for orient in ("portrait", "landscape"):
        d = dict(dev)
        if orient == "landscape":
            v = d["viewport"]; d["viewport"] = {"width": v["height"], "height": v["width"]}
        ctx = await browser.new_context(**d)
        page = await ctx.new_page()
        await page.goto(URL, wait_until="networkidle")
        await check(page, f"{engine}_{tag}_{orient}")
        # Viewport shrink: address bar / virtual keyboard (~40% height lost)
        v = d["viewport"]
        await page.set_viewport_size({"width": v["width"], "height": int(v["height"] * 0.6)})
        await check(page, f"{engine}_{tag}_{orient}_keyboard")
        await page.set_viewport_size(v)
        # Zoom: text/page zoom 150% and 200% (equivalent CSS width reduction)
        for z in (1.5, 2):
            await page.set_viewport_size({"width": int(v["width"] / z), "height": v["height"]})
            await check(page, f"{engine}_{tag}_{orient}_zoom{int(z*100)}")
        await page.set_viewport_size(v)
        await ctx.close()
    await browser.close()

async def main():
    async with async_playwright() as p:
        for engine, name in DEVICES:
            await run(p, engine, name)
    print(f"\n{len(failures)} failure(s)", failures)
    sys.exit(1 if failures else 0)

asyncio.run(main())
