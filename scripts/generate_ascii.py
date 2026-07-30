import sys
import numpy as np
import cv2
from PIL import Image, ImageOps
from fontsubset import subset_font_base64
from rembg import remove

RAMP = " .:-=+*#%@"          # sparse -> dense
FONT_SIZE = 12
ADVANCE = round(FONT_SIZE * 0.6, 3)
LINE_HEIGHT = round(FONT_SIZE * 1.05, 3)

def build(input_path: str, output_path: str, cols: int = 90):
    print("Removing background...")
    im_rgba = remove(Image.open(input_path))
    bg = Image.new("RGBA", im_rgba.size, (255, 255, 255, 255))
    im = Image.alpha_composite(bg, im_rgba).convert("L")

    arr = np.array(im)
    print("Applying filters...")
    arr = cv2.bilateralFilter(arr, d=9, sigmaColor=75, sigmaSpace=75)
    
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    arr = clahe.apply(arr)
    
    arr = np.clip(255.0 * ((arr / 255.0) ** 1.7), 0, 255).astype(np.uint8)
    
    im = Image.fromarray(arr)
    
    w, h = im.size
    rows = round(cols * (h / w) * 0.48)
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
        return {"&": "&amp;", "<": "<", ">": ">"}.get(c, c)

    text_lines = []
    for y, row_chars in enumerate(rows_of_text):
        ty = round((y + 0.85) * LINE_HEIGHT, 2)
        line = "".join(esc(c) for c in row_chars)
        delay = round(y * 0.09, 2)
        rect_y = round(y * LINE_HEIGHT, 2)
        
        text_lines.append(f'''
    <clipPath id="row-{y}">
      <rect x="0" y="{rect_y}" width="0" height="{LINE_HEIGHT}">
        <animate attributeName="width" from="0" to="{view_w}" begin="{delay}s" dur="0.8s" fill="freeze" />
      </rect>
    </clipPath>
    <rect x="-10" y="{rect_y}" width="{ADVANCE}" height="{LINE_HEIGHT}" opacity="0" class="cursor">
      <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.99;1" begin="{delay}s" dur="0.8s" fill="freeze" />
      <animate attributeName="x" from="0" to="{view_w}" begin="{delay}s" dur="0.8s" fill="freeze" />
    </rect>
    <text clip-path="url(#row-{y})" x="0" y="{ty}" textLength="{view_w}" lengthAdjust="spacing" xml:space="preserve">{line}</text>''')

    svg = f'''<svg width="460" viewBox="0 0 {view_w} {view_h}" xmlns="http://www.w3.org/2000/svg">
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
.cursor {{
  fill: #1f2328;
}}
@media (prefers-color-scheme: dark) {{
  text {{ fill: #c9d1d9; }}
  .cursor {{ fill: #c9d1d9; }}
}}
</style>
<g>
{"".join(text_lines)}
</g>
</svg>'''

    with open(output_path, "w") as f:
        f.write(svg)
    print(f"wrote {output_path}: {cols}x{rows} grid, {len(used_chars)} unique glyphs")


if __name__ == "__main__":
    inp = sys.argv[1]
    outp = sys.argv[2]
    cols = int(sys.argv[3]) if len(sys.argv) > 3 else 90
    build(inp, outp, cols)
