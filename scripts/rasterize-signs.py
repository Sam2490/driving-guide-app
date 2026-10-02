"""Step 3: renders each sign SVG to a 384px WebP with transparency (needs Playwright + Chromium)."""
import json, os, asyncio, io
from PIL import Image
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIGNS = json.load(open('/tmp/claude-0/signs_svg.json'))
S = 384
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': S, 'height': S}, device_scale_factor=1)
        for s in SIGNS:
            svg = s['svg'].replace('<svg ', '<svg preserveAspectRatio="xMidYMid meet" ', 1)
            await pg.set_content(f"<html><body style='margin:0;background:transparent'><div style='width:{S}px;height:{S}px;display:flex;align-items:center;justify-content:center'><div style='width:{S-8}px;height:{S-8}px'>{svg}</div></div><style>svg{{width:100%;height:100%;display:block}}</style></body></html>")
            png = await pg.screenshot(omit_background=True)
            im = Image.open(io.BytesIO(png)).convert('RGBA')
            bb = im.getbbox()
            if bb: im = im.crop(bb)
            w, h = im.size; side = max(w, h) + 8
            out = Image.new('RGBA', (side, side), (0, 0, 0, 0)); out.paste(im, ((side - w) // 2, (side - h) // 2))
            out.save(f"{ROOT}/assets/signs/{s['id']}.webp", 'WEBP', quality=90, method=6)
        await b.close()
asyncio.run(main())
