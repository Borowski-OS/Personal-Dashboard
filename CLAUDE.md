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
- Maule W&B defaults (XC planner, from AFM/Form 37): empty 1,467 lb @ 11.77"; arms front+bag A 20, fuel 24 (aux 22.2), rear 53, bag B 42 (175 max), bag C 70 (125 max). Envelopes XC_ENV_WHEELS / XC_ENV_FLOATS; Flying kv `gear`=floats switches.
- KMEV weather: Minden AWOS has not reached the NWS/aviationweather feed since 2026-08-14 (tgftp KMEV.TXT last ob Aug 14; CheckWX/allmetsat show it missing) — page uses nearest reporting station (KCXP). TAFs: backend tafFetch_ caches 20 min, falls back to NOAA tgftp raw TAF (tafFromRaw_ parser) when aviationweather.gov is slow; keepWarm refreshes KMEV,KRNO every 10 min; page keeps last good TAF in localStorage `lifeos_taf` and retries.
- Listing analyzer (Ventures): web action `analyze&url=` (Ventures.js analyzeListing_: Claude web_fetch/web_search reads one listing →
  judgeRental_/judgeBusiness_ with the same rentalMath_/financingPaths_/offerCap_ as the daily search). "Save to my pipeline" writes Stage
  Watching; pipeline stages Watching → Analyzing → Offer made → Pass. keepRow_ keeps watch/analy/offer-made rows so daily refreshes never drop them.
- Phone alerts (Alerts.js): ntfy.sh topic in Config `ntfy_topic` (made by action `testalert`); hourlyAlerts trigger (action `alerttrigger`), quiet 9 PM–6 AM.
  6 PM tomorrow fly window (free on calendar; skipped in sick mode), lesson-weather warnings (calendar titles like lesson/Jeremy/CFI/N3207A),
  8 AM non-autopay bills due in 3 days, new cash-flowing rentals (from refreshProperties_). `alertcheck&hour=18` = dry run.
  Minden TAF is part-time (valid ~5 AM–5 AM), so hours it doesn't cover use the Open-Meteo hourly model. Keep alert text free of balances/account numbers.
- Book with Jeremy: Flying TAF card "Next good window" bar → Google Calendar template link + sms: link (Flying kv `cfi_phone` fills the number).
- Checkride tracker (Flying): ppl109Card + checkrideForecastHtml — pace (last 60 days), projected date at Flying kv `ppl_target_hours` (60) and at 40,
  cost to finish (cfi_rate dual, `solo_rate` 130, `dpe_fee` 1000, written $175), one-time items saved as Flying kv req_* = "yes".
- Snap & file: page POSTs {pw, action:'filedoc', name, mime, data(base64, images shrunk to 1600px JPEG)} to the web app (doPost; Brad only).
  Docs.js reads it with Claude (vision/PDF) and files it: vehicle_service → VehicleService (+ bumps Vehicles.Mileage), medical → Medical (Kind Visit),
  else → Receipts tab. File moves to Drive "Life OS Inbox/Filed". Photos/PDFs dropped in the Drive inbox are filed by importInbox_ (dailySync). `dry:1` = read only.
- Maintenance autopilot (Home & Life → Vehicles): MAINT_ITEMS schedules (truck vs hybrid), last-done from VehicleService Service text (comma-separated),
  mileage estimate from odometer readings in VehicleService ("Odometer reading" rows; ~1,000 mi/mo until two readings 30+ days apart). Due items feed upcomingAlerts.
- Chelsea's view: second password (Script Property CHELSEA_PW_HASH, set by Brad in the "Chelsea's view" modal → action setchelseapw). roleOf_ in Code.js;
  chelseaRequest_ serves ONLY CHELSEA_READ_ tabs (drops bill account #s, vehicle VIN/policy/loan/value, and Brad's flying/business projects) and allows writes
  only to CHELSEA_WRITE_ tabs. Page: ROLE='chelsea' shows Home (renderChelseaHome) + Home & Life; hides AI, edit, alerts, snap. Keep filtering server-side.
- What-if planner (Ventures): wiCard/wiRun — sell X BTC (15% LTCG on gain over cost basis), your share vs partners, equity + cash flow over 5 yrs vs holding the BTC. Inputs remembered in localStorage `lifeos_whatif`.
- Drive-in call rotation: Calls tab (Name, Relation, Phone, Order, Active, LastCalled, Notes). One person per Mon–Thu from Config `call_rotation_start`
  (2026-09-30), cycling by Order (Active=no pauses). Today shows callBar (📞 Call / ✓ Called); Home & Life shows callRotationCard (next 3 weeks).
  Alerts.js callAlert_ sends a 7 AM Mon–Thu phone alert with a tap-to-call button. Page callFor() and backend callFor_() must stay in sync.
- Jeremy's instruction is free; N3207A rents at $175/hr dual or solo (Flying kv cfi_rate=175, solo_rate=175, cfi_phone set).
- Home values: Investments rows "Prospect House" / "Lahontan House" carry Claude's comp-based appraisals (AsOf "(Claude appraisal)"), set by hand —
  updateHomeValues_ no longer overwrites them; RentCast's AVM is saved only as a reference in Config avm_prospect / avm_lahontan.
  Comp sources: Carson City recorded sales via carsoncitynv.devnetwedge.com (POST /Search/ExecuteSalesSearch, then POST /Search/SalesResults;
  parcel detail /parcel/view/<parcel#>/<year>); Humboldt County parcels at humboldt-search.gsacorp.io/parcel/<id> (sales history on each page).
  Backend action `homecomps&which=prospect|lahontan` returns RentCast property record + AVM comps (list prices, not closed sales). Re-appraise yearly.
- AI chat (bottom-right orb, ⌘J): page POSTs {pw, action:'ask', q, history(last 12), tab} → Assistant.js aiChat_ (claude-opus-5-5, effort low,
  web_search + tools add_next_step / log_weight / add_call_person; returns answer, actions, sources). aiContext_ = lifeContext_ + calendar, bills due,
  flying/CFI owed/TAF line, health/sick mode, homes, pipelines, vehicles, calls, habits, trips, radar. Chat history in localStorage `lifeos_ai_chat`.
  ~20–40 s per answer (Apps Script can't stream); the page shows a live status. Chelsea's role can't reach it (POST is Brad-only).
- AI launcher: #aiFab is a canvas "hive" of glowing dots (no label), animated only while visible; aiHiveWake() restarts it.
- Taxes tab (sidebar under Money; Money subnav "Taxes →" on phones): inputs in the Tax kv tab (private sheet; never hard-code numbers here).
  taxCalc(): 2026 MFJ federal (TAX26 constants: brackets, $32,200 std, $40,400 SALT, 0.5% charity floor, IRA $7,500, 403(b) $24,500, SS base $184,500),
  clergy rules — Sec.107 housing exclusion = min(designated, actual, FRV incl. furnishings+utilities); minister pay incl. full allowance is SE income
  (Tax kv brad_pays_se_tax=no for Form 4361); rental Sch E with land-split depreciation + passive-loss phase-out; itemized vs standard; QBI; safe harbor.
  taxMoves() = prioritized actions (checkbox state in Tax kv move_<id>); taxAlerts() feed Today. Planning estimate, not advice — keep the CPA caveat.
- AI orb: canvas.ai-sphere elements (launcher #aiHive + chat welcome) share one rAF loop drawing a ~1,200-point Fibonacci particle sphere
  (3D rotation + flowing radius), Apple-setup style; only visible canvases animate. Tax kv rental_ledger (JSON rows) drives the Schedule E card. Chelsea's flight training + business share of the Maule are deductible on her ground-instruction Sch C (CPA-approved: improves skills in her existing aviation field); Tax kv chelsea_aviation_yr is subtracted from chelsea_sc_net.
