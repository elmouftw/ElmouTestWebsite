#!/usr/bin/env python3
"""Regenerate trend-chaser/ from the live niche-please-trends.surge.sh report.

Fetches the upstream HTML (a single ~50 MB file with images inlined as base64),
extracts the inline `<style>` block to `styles.css`, drops the inline `<script>`
block (we use our own static `script.js` with an HTTP-context clipboard
fallback), saves each unique base64 image to `assets/img-<md5[:12]>.<ext>`
(re-compressed via Pillow), and rewrites the markup to reference the external
files instead of data URIs.

Idempotent: filenames are derived from the upstream base64 payload, so
re-running produces the same outputs unless upstream actually changed.
"""

from __future__ import annotations

import base64
import hashlib
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image

UPSTREAM = "https://niche-please-trends.surge.sh/"
ROOT = Path(__file__).resolve().parents[1]  # trend-chaser/
ASSETS = ROOT / "assets"

DATA_URI_RE = re.compile(
    r"data:image/(png|jpe?g|webp|gif);base64,([A-Za-z0-9+/=]+)"
)
STYLE_RE = re.compile(r"<style[^>]*>(.*?)</style>", re.DOTALL | re.IGNORECASE)
SCRIPT_RE = re.compile(r"<script\b[^>]*>.*?</script>", re.DOTALL | re.IGNORECASE)
HEAD_FONTS_RE = re.compile(
    r'<link[^>]+fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*',
    re.IGNORECASE,
)

EXTERNAL_HEAD = (
    '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link rel="stylesheet" '
    'href="https://fonts.googleapis.com/css2?'
    'family=Inter:wght@400;500;600;700;800;900&'
    'family=Montserrat:wght@400;600;700;800;900&display=swap">\n'
    '<link rel="stylesheet" href="styles.css">\n'
)


class UpstreamUnavailable(Exception):
    """Raised when upstream is unreachable after exhausting retries.

    Treated as a soft failure by main(): the previously committed content
    is left in place and we exit 0 so the workflow can continue to the
    Pages deploy step instead of taking the published site down whenever
    upstream has a hiccup.
    """


def fetch_upstream(
    *,
    attempts: int = 4,
    base_delay: float = 5.0,
) -> str:
    """GET the upstream HTML, retrying transient 5xx / network errors with
    exponential backoff. Raises ``UpstreamUnavailable`` if every attempt
    fails."""
    last_exc: Exception | None = None
    for attempt in range(1, attempts + 1):
        req = urllib.request.Request(
            UPSTREAM,
            headers={
                # Some surge.sh deploys 503 on an empty/odd UA; mimic a real browser.
                "User-Agent": (
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36 "
                    "trend-chaser-regen/1.0"
                ),
                "Accept": "text/html,application/xhtml+xml,*/*",
                "Accept-Language": "en-US,en;q=0.9",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as exc:
            last_exc = exc
            # Retry only on 5xx and 429; 4xx (other than 429) is permanent.
            if exc.code != 429 and exc.code < 500:
                raise UpstreamUnavailable(
                    f"upstream returned HTTP {exc.code} (not retriable)"
                ) from exc
            print(
                f"  attempt {attempt}/{attempts}: HTTP {exc.code} from upstream",
                file=sys.stderr,
            )
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            last_exc = exc
            print(
                f"  attempt {attempt}/{attempts}: {type(exc).__name__}: {exc}",
                file=sys.stderr,
            )
        if attempt < attempts:
            delay = base_delay * (2 ** (attempt - 1))
            print(f"  sleeping {delay:.0f}s before retry", file=sys.stderr)
            time.sleep(delay)
    raise UpstreamUnavailable(
        f"upstream unreachable after {attempts} attempts: {last_exc}"
    )


def hash_payload(b64: str) -> str:
    """Match the original extraction scheme: md5(base64 string)[:12]."""
    return hashlib.md5(b64.encode("ascii")).hexdigest()[:12]


def optimize_image(path: Path) -> None:
    """Re-compress in place to keep the assets/ folder small."""
    try:
        with Image.open(path) as img:
            if path.suffix.lower() == ".png":
                img.save(path, optimize=True)
            elif path.suffix.lower() in {".jpg", ".jpeg"}:
                img.convert("RGB").save(
                    path,
                    format="JPEG",
                    quality=78,
                    optimize=True,
                    progressive=True,
                )
    except Exception as exc:  # pragma: no cover - non-fatal
        print(f"  warn: could not optimize {path.name}: {exc}", file=sys.stderr)


def replace_images(html: str) -> tuple[str, set[str]]:
    """Replace every data:image URI with an `assets/<file>` reference,
    saving new files as needed. Returns the rewritten HTML and the set of
    asset filenames that were referenced."""
    used: set[str] = set()

    def repl(match: re.Match[str]) -> str:
        ext = match.group(1).lower().replace("jpeg", "jpg")
        b64 = match.group(2)
        name = f"img-{hash_payload(b64)}.{ext}"
        path = ASSETS / name
        if name in used:
            return f"assets/{name}"
        if not path.exists():
            try:
                path.write_bytes(base64.b64decode(b64))
                optimize_image(path)
                print(f"  + {name}")
            except Exception as exc:
                # Don't add to `used` — preserve the data URI so a retry on
                # a later occurrence (or a future run) can still recover.
                print(f"  ! failed to write {name}: {exc}", file=sys.stderr)
                return match.group(0)
        used.add(name)
        return f"assets/{name}"

    return DATA_URI_RE.sub(repl, html), used


def split_and_rewrite(html: str) -> tuple[str, str]:
    """Pull the inline <style> out, drop inline <script>, inject external refs.
    Returns (html, css)."""
    style_match = STYLE_RE.search(html)
    if not style_match:
        raise SystemExit("upstream HTML is missing a <style> block")
    css = style_match.group(1).strip()
    # Strip @import for fonts — we link to Google Fonts directly in <head>.
    css = re.sub(r"@import\s+url\([^)]+\);?\s*", "", css)

    html_no_style = html[: style_match.start()] + html[style_match.end():]
    html_no_scripts = SCRIPT_RE.sub("", html_no_style)
    # Drop any pre-existing Google Fonts <link> tags so we control the head.
    html_clean = HEAD_FONTS_RE.sub("", html_no_scripts)

    if "</head>" not in html_clean:
        raise SystemExit("upstream HTML has no </head>")
    html_clean = html_clean.replace("</head>", EXTERNAL_HEAD + "</head>", 1)
    html_clean = html_clean.replace(
        "</body>",
        '<script src="script.js"></script>\n</body>',
        1,
    )
    return html_clean, css


def prune_orphans(used: set[str]) -> None:
    if not ASSETS.exists():
        return
    for f in ASSETS.iterdir():
        if f.is_file() and f.name not in used:
            print(f"  - {f.name} (orphaned)")
            f.unlink()


def main() -> int:
    print(f"Fetching {UPSTREAM} …")
    try:
        html = fetch_upstream()
    except UpstreamUnavailable as exc:
        # Soft-fail: leave previously committed content in place so the
        # workflow can still publish the existing site to Pages. The next
        # scheduled run (or push) will catch up once upstream recovers.
        print(f"WARNING: {exc}", file=sys.stderr)
        print(
            "Skipping regeneration; existing index.html / assets/ are unchanged.",
            file=sys.stderr,
        )
        # Surface the soft-fail to the workflow via a GHA output so the
        # commit step can also short-circuit cleanly.
        gha_output = os.environ.get("GITHUB_OUTPUT")
        if gha_output:
            with open(gha_output, "a", encoding="utf-8") as fh:
                fh.write("upstream_skipped=true\n")
        return 0
    print(f"  {len(html):,} chars")

    ASSETS.mkdir(parents=True, exist_ok=True)

    print("Extracting images …")
    html, used = replace_images(html)
    print(f"  {len(used)} unique images referenced")

    print("Rewriting <head> / <script> …")
    html, css = split_and_rewrite(html)

    (ROOT / "index.html").write_text(html, encoding="utf-8")
    (ROOT / "styles.css").write_text(css + "\n", encoding="utf-8")
    print(
        f"Wrote index.html ({len(html):,} chars) "
        f"and styles.css ({len(css):,} chars)"
    )

    prune_orphans(used)
    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
