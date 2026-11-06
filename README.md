# Trading support

A narrow session check-in companion designed to sit beside TradingView.

## Run locally

From this directory, run:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173` in a browser. Check-ins, mood, and the optional note persist in the browser until reset.

The weekly high-impact news markers use a same-origin snapshot of the public Forex Factory calendar feed, refreshed by the GitHub Pages workflow every six hours. If the feed is unavailable, the calendar shows a manual-check message and links to Forex Factory.