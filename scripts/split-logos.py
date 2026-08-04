from pathlib import Path

from PIL import Image, ImageChops

root = Path(__file__).resolve().parents[1]
src = Image.open(root / "logos.png").convert("RGBA")
w, h = src.size
out = root / "public" / "brand"
out.mkdir(parents=True, exist_ok=True)


def trim(im: Image.Image, padding: int = 8) -> Image.Image:
    bg = Image.new("RGBA", im.size, im.getpixel((0, 0)))
    diff = ImageChops.difference(im, bg)
    bbox = diff.getbbox()
    if not bbox:
        return im
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(im.width, right + padding)
    bottom = min(im.height, bottom + padding)
    return im.crop((left, top, right, bottom))


def make_square(im: Image.Image, size: int = 512, fill=(0, 0, 0, 0)) -> Image.Image:
    # Fit content into a square canvas
    im = trim(im, 4)
    side = max(im.width, im.height)
    canvas = Image.new("RGBA", (side, side), fill)
    canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2), im)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


# Top full logo
full = trim(src.crop((0, 0, w, int(h * 0.52))), 10)
full.save(out / "logo-full.png")

# Bottom icons
bottom = src.crop((0, int(h * 0.54), w, h))
bw, bh = bottom.size
left = trim(bottom.crop((0, 0, bw // 2, bh)), 6)
right = trim(bottom.crop((bw // 2, 0, bw, bh)), 6)

# Light icon: white card on gray — keep white card fill
light_sq = make_square(left, 512, fill=(245, 246, 248, 255))
# Vibrant icon: blue card on navy — keep transparent outside for app use, then square crop of blue card
vibrant_sq = make_square(right, 512, fill=(5, 10, 20, 255))

light_sq.save(out / "icon-light.png")
vibrant_sq.save(out / "icon-vibrant.png")
light_sq.save(out / "icon-light-512.png")
vibrant_sq.save(out / "icon-vibrant-512.png")
light_sq.resize((32, 32), Image.Resampling.LANCZOS).save(out / "favicon-32.png")
vibrant_sq.resize((180, 180), Image.Resampling.LANCZOS).save(out / "apple-touch-icon.png")

# Pill mark from light icon center (for compact nav)
mark = make_square(left, 256, fill=(255, 255, 255, 0))
mark.save(out / "mark-pill.png")

# Next.js app icons
app_dir = root / "src" / "app"
app_dir.mkdir(parents=True, exist_ok=True)
light_sq.resize((32, 32), Image.Resampling.LANCZOS).save(app_dir / "favicon.ico")
vibrant_sq.resize((512, 512), Image.Resampling.LANCZOS).save(app_dir / "icon.png")
vibrant_sq.resize((180, 180), Image.Resampling.LANCZOS).save(app_dir / "apple-icon.png")

print("done")
for p in sorted(out.glob("*.png")):
    print(p.name, Image.open(p).size)
