# Life OS dashboard — notes for Claude sessions

- `index.html` in this repo IS the dashboard page and the source of truth. Edit it here and push to `main`;
  the Pages workflow publishes it (a newer run cancels a stuck one). No Google sign-in is needed for page changes.
- The Apps Script's `syncSite()` is disabled on purpose (it used to overwrite index.html). Don't re-enable it.
- Data lives in Brad's Life OS Google Sheet, read/written through the Apps Script web app (password-gated JSONP).
  Backend files (Apps Script project, edited with clasp — never committed here): Code.js, Ventures.js (crypto value,
  weekly business/rental search + listing liveness), Aviation.js (TAF proxy, morning-email fly/AQI lines),
  Ical.js (Apple/ICS calendar feeds via Config `ical_urls`), Logbook.js (ForeFlight CSV import from Drive "Life OS Inbox").
- Schedules: dailySync ~4 AM PT (calendar, Strava, rates, home value, net-worth snapshot, Radar, crypto, logbook, email brief);
  weeklyVentures Mon ~4 AM (businesses), weeklyProperties Mon ~5 AM (rentals).
- Tabs (7 domains): overview=Today, home=Money, ventures, flying, health, life=Home & Life, faith. Old keys
  (projects, vehicles, hobbies, family, travel) alias into Home & Life sections.
- Brad's rules: hide anything with Stage Pass/Dead; no software/SaaS businesses; rentals must cash-flow > $0 at today's
  investor rate (at list or a days-on-market-capped offer) and be within ~1 hr of Carson City; only verified-live listings.
- This repo is PUBLIC. Never commit data.js, Code.js or other backend files, .clasprc.json, passwords, or personal financial data.
- Brad doesn't code: work autonomously, explain in plain English, and only ask for things only he can do.
- CFI balance: Flying kv `cfi_rate`, `cfi_aircraft` (tail), `cfi_paid_through` (date). Owed = hours in that tail after the date × rate; "Mark paid" advances the date.
- Medical tab (Start, End, Kind, What, Symptoms, Treatment, Notes). An Illness row with no End = "sick mode": training targets paused, recovery plan on Health, IMSAFE grounding on Today/Flying.
