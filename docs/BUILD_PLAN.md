# Personal Dashboard — Build Plan & Progress Tracker

> **Purpose of this file:** Brad asked for an all-day autonomous build. Sessions
> re-fire as usage resets. ANY re-fired session should read this file first and
> resume at the first unchecked box. Keep it updated as the single source of truth.

_Last updated by session: 2026-09-11_

## STATUS (for Brad, and for the hourly loop)
**Built & committed:** Apps Script data layer, full 9-tab dashboard (`dashboard/site/index.html`),
Pages workflow, SETUP.md. **Delivered privately (not in git):** `seedData.gs` (real figures)
+ a clickable **PREVIEW artifact** with sample data.
**Blocked on Brad (only he can):** (1) create public repo `LSSouthReno/Personal-Dashboard`;
(2) deploy the Apps Script web app + set password. Until (1), the site can't go live.
**SITE PUSHED (2026-09-12):** Brad created `LSSouthReno/Personal-Dashboard`; site pushed to
`main` (index.html, .nojekyll, README, pages.yml w/ 15-min schedule). GitHub Actions token
CANNOT enable Pages ("Resource not accessible by integration"), so **Brad must set repo
Settings→Pages→Source: GitHub Actions once**; then the scheduled workflow auto-publishes to
https://lssouthreno.github.io/Personal-Dashboard/. Go-live watcher routine DELETED (job done).
**DATA:** connectors can't populate Sheet cells or deploy Apps Script — those need Brad.
Private seedData.gs (v2: + vehicles/VINs, NV Energy, points/KTNs, hunting draw codes,
skiing, front-door & sauna projects; safe code + bank login excluded) delivered to Brad
privately. Remaining for Brad: enable Pages (1 click) + ~5-min Apps Script setup.

## The decision (locked with Brad, 2026-09-11)

- **Aesthetic:** clone the church dashboard (`LSSouthReno/Church-Dashboard`) — dark
  `#1a1a1a`, Montserrat, fixed top nav with colored tab underlines, `.card` grid,
  Chart.js. Read that repo's `index.html` head/CSS for exact tokens.
- **Privacy model (IMPORTANT):** *public page shell, gated live data.*
  - GitHub Pages hosts ONLY `index.html` (the UI shell). It contains **no personal data**.
  - All sensitive data (bills, budget, accounts, contacts) is fetched **at runtime**
    from a **Google Apps Script Web App** (`doGet`) that requires a password hash.
  - The page prompts for a password, SHA-256 hashes it in-browser, and sends the hash
    to the Apps Script; the script returns JSON only if the hash matches. Nothing
    sensitive is ever committed to git. (Same SHA-256 gate the church dashboard's admin
    panel uses — see `Code_onboarding_guides.gs` `PW_HASH`.)
- **Tabs (9):** Overview · Home & Bills · Projects · Flying · Money & Budget · Hobbies ·
  Vehicles · Health & Fitness · Travel.
- **Money tab modules (all 4):** bills/subscriptions rollup · monthly budget vs actual ·
  accounts/net-worth/debt (incl. mortgage/refi tracker) · investments/savings goals/BTC.
- **Seeding:** Brad approved scanning **Gmail + Drive** to pre-draft bills, subscriptions,
  renewal dates, and vendor phone numbers. Pull flying/fitness/financial context from the
  Personal-OS `brain/` files too.
- **Data entry surface:** one Google Sheet, "Personal Dashboard Data", one tab per data
  set. Apps Script reads it and serves gated JSON. Brad edits the Sheet; site refreshes.

## Architecture

```
Google Sheet ("Personal Dashboard Data")   <- Brad edits here
        │  (Apps Script reads on request)
        ▼
Google Apps Script Web App  (doGet?pw=<sha256>&tab=all)  -> returns JSON if hash matches
        ▲
        │  fetch() at runtime, no-store
Public GitHub repo "Personal-Dashboard" -> GitHub Pages -> index.html (shell only)
```

No GitHub token / no committed data needed for the data path (unlike church, which
commits JSON). This keeps personal data off public git entirely.

## Repos
- **Deployable:** NEW public repo `LSSouthReno/Personal-Dashboard` (Pages on).
- **Source of record / this plan / Apps Script copies / docs:** `LSSouthReno/Personal-OS`
  branch `claude/modest-noether-jujweg`, under `dashboard/`.

## What only Brad can do (kept to a minimum; build must NOT block on these)
1. Open the Apps Script (link in `dashboard/SETUP.md`), click **Authorize**, and
   **Deploy → Web app** (Execute as: me; Who has access: Anyone). Paste the resulting
   `/exec` URL into the Sheet's `Config` tab (or tell the assistant). ~5 min.
2. Confirm/choose the dashboard password (default set in Sheet `Config`; he can change).
3. If Pages source isn't auto-set: repo Settings → Pages → Source = GitHub Actions (1 click).
4. Fill remaining blanks in the Sheet at leisure (assistant pre-fills most from Gmail/Drive).
5. OPTIONAL: authorize the Ramp connector for live spend/transactions in Money tab.

## Build checklist (resume at first unchecked)

### Phase 0 — Foundation
- [x] Study church dashboard architecture & aesthetic
- [x] Confirm decisions with Brad
- [x] Write this plan + intake questionnaire to Personal-OS branch
- [ ] **BLOCKED ON BRAD:** create empty public repo `LSSouthReno/Personal-Dashboard`
      (integration is 403-blocked from creating repos). Once it exists: `add_repo` push +
      push_files the shell. Build everything locally under `dashboard/site/` meanwhile.
- [ ] Verify Pages builds & is reachable

### Phase 0.5 — Data captured (live session, connectors) — PRIVACY-CRITICAL
- [x] Read Borowski Budget sheet (income, budget, net worth, mortgages, refi, plane)
- [x] Gmail scan for bills/subscriptions/vendors/aircraft/hobbies
- [x] Pulled brain/ context (flight, fitness, financial, profile)
- [x] Seed notes saved ONLY to the session scratchpad (SEED_DATA.md), **never committed**.
      Reason: an auto-mode guardrail correctly blocked committing Gmail/sheet-derived data,
      which also matches Brad's privacy model. **RULE: nothing derived from Gmail or the
      budget sheet — account numbers, balances, net worth, vendor rosters — goes into git.**
      It flows only Sheet → Apps Script → page at runtime.
- [ ] Deliver the sensitive seed to Brad PRIVATELY (not via git): a one-time `seedData()`
      Apps Script snippet OR a private Google Doc in his Drive, so his sheet fills without
      typing. The connector-free loop CANNOT do this (no connectors); do it in a live session.

### Phase 1 — Data layer
- [x] Apps Script `Code_personal_dashboard.gs` written (SCHEMA-driven: `setup()` builds all
      tabs+headers, `doGet` gated JSON via SHA-256 pw compared to Config sheet password,
      JSONP `?callback=` for cross-origin). Password lives ONLY in the private sheet.
- [x] Tab schema defined in-script: Config, Highlights, NextActions, Bills, Contacts,
      BudgetCategories, Accounts, Debts, Investments, SavingsGoals, Projects, ProjectTasks,
      Flying, Aircraft, FlightLog, Hobbies, Vehicles, VehicleService, Health, HealthLog,
      Travel, TravelChecklist, Points.
- [x] `SETUP.md` written (create repo, paste+run setup(), set password, deploy web app, Pages).
- [ ] (Brad, live-session task) generate + deliver private `seedData()` from scratchpad SEED_DATA.

### Phase 2 — Seeding (fill the Sheet with real data)
- [ ] Scan Gmail for recurring bills/subscriptions/receipts → draft Bills + Contacts rows
- [ ] Scan Drive for existing budget/finance/vehicle/hobby sheets/docs → merge
- [ ] Pull brain/: flight.md→Flying, fitness.md→Health, financial.md+profile.md→Money/refi
- [ ] Write drafted data into the Sheet (mark uncertain cells with a NEEDS-REVIEW note)

### Phase 3 — The dashboard UI (index.html, all tabs) — v1 BUILT (dashboard/site/index.html)
- [x] Shell: top nav (9 tabs), password+URL gate, JSONP loader, refresh/lock, error states
- [x] Overview (auto KPI tiles from every tab + Highlights + next-actions + jump grid)
- [x] Home & Bills (bills sorted by monthly cost, tel: call links, vendor URL, contacts table)
- [x] Projects (cards by status, budget/spent bar, per-project task checklist)
- [x] Flying (hours/rating/written tiles, training info, Aircraft table, FlightLog)
- [x] Money & Budget (net worth, budget-vs-actual bars, spending-mix doughnut, accounts/debts/investments/goals)
- [x] Hobbies (per-hobby cards)
- [x] Vehicles (per-vehicle cards + service history)
- [x] Health & Fitness (rhythm/metrics + log)
- [x] Travel (upcoming/past trip cards, checklists, points)
- [x] Responsive (cols collapse at 1000/640px); empty states everywhere; JS syntax-checked
- [x] Net-worth-over-time line chart (Money tab; reads new NetWorthHistory sheet tab)
- [x] Print CSS + prefers-reduced-motion
- [ ] REMAINING POLISH (needs a LIVE connector session, not the loop): live-read from
      Borowski Budget sheet; Google Calendar travel import; republish preview artifact.

### Phase 3.5 — Site packaging (ready to push to Personal-Dashboard repo)
- [x] dashboard/site/index.html, .nojekyll, README.md, .github/workflows/pages.yml (15-min-safe deploy)

### Phase 4 — Ship & wire
- [ ] Push final index.html to Personal-Dashboard; confirm live URL
- [ ] Mirror index.html + gs + docs into Personal-OS dashboard/
- [ ] SETUP.md finalized; leave Brad a "3 clicks to go live" summary
- [ ] (When Brad deploys web app) paste /exec URL, confirm data loads through the gate

## Notes / gotchas discovered
- Church Pages workflow deploys on a 15-min cron (not per-commit) to avoid deploy pileups.
  Reuse that workflow verbatim for Personal-Dashboard.
- Apps Script ContentService can't set CORS headers for cross-origin fetch from the Pages
  origin. Solution: serve JSONP (`?callback=`) OR fetch as text via the `/exec` URL which
  DOES allow CORS for `text/plain`/JSON from `script.google.com`... VERIFY: use JSONP to be
  safe (church uses same-origin JSON files, so this is the one new wrinkle). Test early.
- Sheet cell cap 50k chars (church code notes MAX_JSON 45000) — keep per-cell JSON small.
