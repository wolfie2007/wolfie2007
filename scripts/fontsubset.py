"""
Subsets JetBrains Mono down to only the characters a given SVG actually
uses, converts to woff2, and returns a base64 string ready to inline into
an SVG <style> block as a @font-face src. Keeps each generated SVG small
(a few KB instead of ~300KB for the full font).
"""
import base64
import subprocess
import tempfile
import os

FONT_DIR = os.path.join(os.path.dirname(__file__), "fonts_src")


def subset_font_base64(characters: str, weight: str = "Regular") -> str:
    """characters: every unique glyph that appears in the target SVG."""
    src = os.path.join(FONT_DIR, f"JetBrainsMono-{weight}.ttf")
    uniq = "".join(sorted(set(characters)))
    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, "subset.woff2")
        subprocess.run(
            [
                "fonttools", "subset", src,
                f"--text={uniq}",
                "--flavor=woff2",
                "--no-hinting",
                "--desubroutinize",
                "--drop-tables+=DSIG",
                f"--output-file={out}",
            ],
            check=True,
            capture_output=True,
        )
        with open(out, "rb") as f:
            data = f.read()
    return base64.b64encode(data).decode("ascii")
