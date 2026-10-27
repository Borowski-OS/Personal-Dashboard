# Aircraft relay (Who's flying)

The Flying tab's **Who's flying** card asks this Cloudflare Worker about a few tail numbers.
The Worker asks **FlightAware AeroAPI** (Personal plan) and returns where each plane is,
where it's headed, ETA and when it landed. It holds the FlightAware key so the public page
never sees it, and it only answers pages on `borowski-os.github.io` (and localhost).

(The free ADS-B feeds — adsb.fi, adsb.lol, airplanes.live, OpenSky — all refuse requests
from Cloudflare's servers, which is why this uses FlightAware.)

## Cost control

- Planes in the air: status + position at most every 5 min (`AIR_TTL_SEC` = 270). Planes on the ground: status at most
  every 15 min (`IDLE_TTL_SEC` = 840). Positions are only ever fetched for planes in the air.
- Runs 24/7: no overnight pause.
- Soft target `MONTHLY_TARGET_USD` = $100: once month-to-date spend passes it, the answer carries `budget.warn=true`
  (Freedom Air's server logs it and pings the phone once a day). Nothing stops.
- `MONTHLY_CAP_USD` = $400 is only a runaway backstop; past it the Worker serves what it already has.
- Answers are shared through Workers KV (`STATE`). Freedom Air's page only reads a published data.json, so open tabs cost nothing.
  (The Life OS Flying tab sends `fresh=1` when opened, which forces a 2-min-old answer.)

Pricing used (per call, from the Worker): status $0.005, position $0.01, airport $0.015, track $0.01.
Roughly $0.18 per plane-hour in the air (12 polls x $0.015) and $0.02 per plane-hour on the ground.

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
