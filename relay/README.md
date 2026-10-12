# Aircraft relay (Who's flying)

The Flying tab's **Who's flying** card asks this Cloudflare Worker about a few tail numbers.
The Worker asks **FlightAware AeroAPI** (Personal plan) and returns where each plane is,
where it's headed, ETA and when it landed. It holds the FlightAware key so the public page
never sees it, and it only answers pages on `borowski-os.github.io` (and localhost).

(The free ADS-B feeds — adsb.fi, adsb.lol, airplanes.live, OpenSky — all refuse requests
from Cloudflare's servers, which is why this uses FlightAware.)

## Cost control

Fresh when you look, slow while idle:
- Opening or returning to the Flying tab sends `fresh=1`: flight status is never more than 2 min old.
- While the tab just sits open: parked planes are re-checked every 20 min, planes in the air (or due
  out within the hour) every 5 min, and positions for planes in the air every 60 s.
- If the month's spending runs ahead of an even pace, the 20-min idle check stretches toward 60 min
  (looking at the tab is still always fresh).
- Answers are shared through Workers KV (`STATE`), so several open screens cost the same as one.
- Monthly spending cap `MONTHLY_CAP_USD` (wrangler.toml): $15 — Brad OK'd up to $15/mo in Oct 2026;
  the first $5 is FlightAware's free Personal credit. Past the cap it only serves what it already has.
  The page shows "$x of $15 used this month".
- Nothing is looked up unless the Flying tab is open and visible somewhere.

Rough cost: ~2¢ per look, ~6¢ per hour the tab sits open with nobody flying, plus ~$0.60/hour per
plane in the air.

## Deploy / update

```bash
cd relay
npx wrangler@4 login                   # once
npx wrangler@4 secret put AEROAPI_KEY  # once; paste the key from flightaware.com/aeroapi/portal → API Keys
npx wrangler@4 deploy
```

Worker URL: https://lifeos-aircraft.brad-5a1.workers.dev/aircraft (`AT_RELAY` in index.html,
or override with Config key `aircraft_relay_url` in the sheet).

## Which planes

Flying sheet key `tracked_aircraft`, e.g. `N51207 = Brad & Chelsea; N6058A = Mike; N3207A; N6489X`.
Without it the page tracks `AT_DEFAULT_TAILS`.
