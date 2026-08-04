from pathlib import Path

from PIL import Image

src = Path(__file__).resolve().parents[1] / "public" / "brand" / "logo-full.png"
img = Image.open(src).convert("RGBA")
pixels = img.load()
w, h = img.size

corners = [pixels[0, 0], pixels[w - 1, 0], pixels[0, h - 1], pixels[w - 1, h - 1]]
bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))
print("bg approx", bg)

threshold = 30
changed = 0
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if (
            abs(r - bg[0]) <= threshold
            and abs(g - bg[1]) <= threshold
            and abs(b - bg[2]) <= threshold
        ):
            dist = max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2]))
            if dist <= 14:
                pixels[x, y] = (r, g, b, 0)
            else:
                alpha = int(255 * (dist / threshold))
                pixels[x, y] = (r, g, b, alpha)
            changed += 1

img.save(src)
print("updated", src, "pixels touched", changed, "size", w, h)
