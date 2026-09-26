# Life OS dashboard — notes for Claude sessions

- `index.html` in this repo IS the dashboard page and the source of truth. Edit it here and push to `main`;
  the Pages workflow publishes it (a newer run cancels a stuck one). No Google sign-in is needed for page changes.
- The Apps Script's `syncSite()` is disabled on purpose (it used to overwrite index.html). Don't re-enable it.
- Data lives in Brad's Life OS Google Sheet, read/written through the Apps Script web app (password-gated JSONP).
  Backend files (Apps Script project, edited with clasp — never committed here): Code.js, Ventures.js (crypto value,
  weekly business/rental search + listing liveness), Aviation.js (TAF proxy, morning-email fly/AQI lines),
  Ical.js (Apple/ICS calendar feeds via Config `ical_urls`), Logbook.js (ForeFlight CSV import from Drive "Life OS Inbox").
- Schedules: dailySync ~4 AM PT (calendar, Strava, rates, home value, net-worth snapshot, Radar, crypto, logbook, email brief);
  weeklyVentures Mon ~4 AM (businesses), weeklyProperties DAILY ~5 AM (rentals, 2-40 units; 2 web searches/run).
- Tabs (7 domains): overview=Today, home=Money, ventures, flying, health, life=Home & Life, faith. Old keys
  (projects, vehicles, hobbies, family, travel) alias into Home & Life sections.
- Brad's rules: hide anything with Stage Pass/Dead; no software/SaaS businesses; rentals (2-40 units) must cash-flow > $0 at today's
  investor rate on some financing path (conventional/DSCR, commercial for 5+, seller financing if offered; cash over ~$190K = partners/hard money) at list or a days-on-market-capped offer and be within ~1 hr of Carson City; only verified-live listings.
- This repo is PUBLIC. Never commit data.js, Code.js or other backend files, .clasprc.json, passwords, or personal financial data.
- Brad doesn't code: work autonomously, explain in plain English, and only ask for things only he can do.
- Who's flying (Flying tab, below go/no-go): live map of the planes Brad, Chelsea and friends fly. Data from FlightAware
  AeroAPI (Personal plan) via the Cloudflare Worker in `relay/` (Brad's Cloudflare account; key is a Worker secret; KV-cached;
  $5/month cap). Free ADS-B feeds block Cloudflare, so don't switch back. URL in `AT_RELAY` or Config `aircraft_relay_url`.
  Planes from Flying kv `tracked_aircraft` ("N51207 = Brad & Chelsea; N6058A = …"), else `AT_DEFAULT_TAILS`.
- CFI balance: Flying kv `cfi_rate`, `cfi_aircraft` (tail), `cfi_paid_through` (date). Owed = hours in that tail after the date × rate; "Mark paid" advances the date.
- Medical tab (Start, End, Kind, What, Symptoms, Treatment, Notes). An Illness row with no End = "sick mode": training targets paused, recovery plan on Health, IMSAFE grounding on Today/Flying.
- Drive inbox ("Life OS Inbox", link in Config `inbox_url`, set by running `setupDriveInbox` once): importInbox_ reads ForeFlight + Cronometer CSVs (daily nutrition/servings → Nutrition tab; biometrics weight → HealthLog + Health weight; WHOOP/Apple recovery, HRV, RHR, sleep → Recovery tab). Web action `importcsv` imports CSV text directly.
- Known backend bug (Apps Script `action=apt`, not in this repo): a batch containing non-airport codes (VORs like FMG,
  GPS fixes like BODAD) comes back `ok:false` with "TypeError: (arr || []).forEach is not a function" — likely
  aviationweather.gov answering HTTP 204 (empty) when nothing matches. The page now works around it (per-code retry,
  clear "not an airport" message); the real fix is to treat an empty/204 response as [] in the backend.
