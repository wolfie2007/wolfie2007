"""
Generates the small terminal-style section heading SVGs (hd-about.svg,
hd-stack.svg, hd-projects.svg, hd-stats.svg, hd-about-this-page.svg).
Each one is just styled text in the subsetted custom font -- these exist
as images (not markdown headers) purely so the font renders on GitHub,
since GitHub strips CSS/fonts from the README's own markup.
"""
import os
from fontsubset import subset_font_base64

OUT_DIR = os.path.join(os.path.dirname(__file__), "..")

HEADINGS = {
    "hd-about.svg": "about",
    "hd-stack.svg": "stack",
    "hd-projects.svg": "projects",
    "hd-stats.svg": "stats",
    "hd-about-this-page.svg": "about this page",
}

FONT_SIZE = 20
PADDING_X = 4
PROMPT = "#"


def build(label: str, out_path: str):
    text = f"{PROMPT} {label}"
    chars = set(text)
    font_b64 = subset_font_base64("".join(chars), "Bold")

    # rough width estimate for JetBrains Mono bold at this size (~0.62em/char)
    char_w = FONT_SIZE * 0.62
    width = round(len(text) * char_w + PADDING_X * 2, 1)
    height = round(FONT_SIZE * 1.5, 1)
    baseline = round(height * 0.68, 1)

    svg = f'''<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">
<style>
@font-face {{
  font-family: 'JBMB';
  src: url(data:font/woff2;base64,{font_b64}) format('woff2');
}}
text {{
  font-family: 'JBMB', monospace;
  font-weight: bold;
  font-size: {FONT_SIZE}px;
}}
.prompt {{ fill: #3fb950; }}
.label {{ fill: #1f2328; }}
@media (prefers-color-scheme: dark) {{
  .label {{ fill: #e6edf3; }}
}}
</style>
<text x="{PADDING_X}" y="{baseline}"><tspan class="prompt">{PROMPT}</tspan><tspan class="label"> {label}</tspan></text>
</svg>'''

    with open(out_path, "w") as f:
        f.write(svg)
    print(f"wrote {out_path}")


if __name__ == "__main__":
    for filename, label in HEADINGS.items():
        build(label, os.path.join(OUT_DIR, filename))
