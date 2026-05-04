# Trend Chaser — Daily POD Money Signals

A static recreation of [niche-please-trends.surge.sh](https://niche-please-trends.surge.sh/) — a
daily Print-on-Demand (POD) trend report by Niche Please.

The original site was a single self-contained HTML file with embedded base64
images. This recreation splits it into:

```
trend-chaser/
├── index.html       # Markup + content (calendar events + 25 trend cards)
├── styles.css       # All styles (extracted from inline <style>)
├── script.js        # Interactivity: copy buttons, expand/collapse, http fallback
└── assets/          # Logo + 30 art-style reference images (downscaled & re-compressed)
```

## Features (mirrors the original)

- **Header:** logo, daily run counters (scans / total runs / streak), source
  pill list, scan timestamp.
- **Upcoming holidays calendar:** 30 cards across `DESIGN NOW`, `COMING SOON`,
  `THIS MONTH`, `PLAN AHEAD`. Click a card to expand and reveal:
  - Amazon best-seller search links
  - Etsy best-seller link
  - Recommended art-style reference image
  - 5 design prompts with one-click **Copy** buttons
- **25 trend cards:** rank, opportunity tag, money score, demand/competition
  bars, "Source Energy Score", best angles, final-decision verdict. Each card
  has 4 expandable sections:
  - 📡 Signals & Competition (with shirt-demand / virality / catchphrase /
    shirtability bars + competition snapshot)
  - 💰 Money Score (full breakdown + trend stage / upload window)
  - 🚀 Design Brief + Action Plan (urgency banner, action plan, design brief,
    phrase variations, backend keywords)
  - 🎨 Design Prompts + Why It's Trending (selection rationale, Amazon/Etsy
    references, art-style reference, 5 prompt copy buttons)
- **Copy-to-clipboard fallback:** uses `navigator.clipboard` when in a secure
  context, falls back to `document.execCommand('copy')` for `http://` and
  `file://` so it works during local development.

## Run locally

```bash
cd trend-chaser
python3 -m http.server 8000
# open http://localhost:8000
```

Or open `index.html` directly in a browser — the copy fallback handles
`file://` too.
