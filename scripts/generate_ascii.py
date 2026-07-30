"""
Converts a portrait photo into ascii.svg: a grid of monospace characters
whose density encodes pixel brightness. Bright (lit) areas render as dense
characters, dark background renders as sparse/blank -- so the subject reads
clearly against a transparent SVG background in either GitHub theme.

Usage: python3 generate_ascii.py <input_photo> <output_svg> [cols]
"""
import sys
from PIL import Image, ImageOps
from fontsubset import subset_font_base64

RAMP = " .:-=+*#%@"          # sparse -> dense
FONT_SIZE = 12
ADVANCE = round(FONT_SIZE * 0.6, 3)   # JetBrains Mono advance width = 0.6em
LINE_HEIGHT = round(FONT_SIZE * 1.05, 3)


def build(input_path: str, output_path: str, cols: int = 100):
    im = Image.open(input_path).convert("L")
    im = ImageOps.autocontrast(im, cutoff=1)
    w, h = im.size
    cell_aspect = ADVANCE / LINE_HEIGHT
    rows = round(cols * (h / w) * cell_aspect)
    small = im.resize((cols, rows), Image.LANCZOS)

    pixels = small.load()
    used_chars = set(" ")
    rows_of_text = []
    for y in range(rows):
        row_chars = []
        for x in range(cols):
            b = pixels[x, y] / 255.0
            idx = round(b * (len(RAMP) - 1))
            ch = RAMP[idx]
            row_chars.append(ch)
            used_chars.add(ch)
        rows_of_text.append(row_chars)

    font_b64 = subset_font_base64("".join(used_chars), "Regular")

    view_w = round(cols * ADVANCE, 2)
    view_h = round(rows * LINE_HEIGHT, 2)

    def esc(c):
        return {"&": "&amp;", "<": "&lt;", ">": "&gt;"}.get(c, c)

    text_lines = []
    for y, row_chars in enumerate(rows_of_text):
        ty = round((y + 0.85) * LINE_HEIGHT, 2)
        line = "".join(esc(c) for c in row_chars)
        text_lines.append(
            f'<text x="0" y="{ty}" textLength="{view_w}" '
            f'lengthAdjust="spacing" xml:space="preserve">{line}</text>'
        )

    svg = f'''<svg viewBox="0 0 {view_w} {view_h}" xmlns="http://www.w3.org/2000/svg">
<style>
@font-face {{
  font-family: 'JBM';
  src: url(data:font/woff2;base64,{font_b64}) format('woff2');
}}
text {{
  font-family: 'JBM', monospace;
  font-size: {FONT_SIZE}px;
  fill: #1f2328;
  white-space: pre;
}}
@media (prefers-color-scheme: dark) {{
  text {{ fill: #c9d1d9; }}
}}
</style>
<g>
{chr(10).join(text_lines)}
</g>
</svg>'''

    with open(output_path, "w") as f:
        f.write(svg)
    print(f"wrote {output_path}: {cols}x{rows} grid, {len(used_chars)} unique glyphs")


if __name__ == "__main__":
    inp = sys.argv[1]
    outp = sys.argv[2]
    cols = int(sys.argv[3]) if len(sys.argv) > 3 else 100
    build(inp, outp, cols)
