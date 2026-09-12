# Personal Dashboard — Intake Questionnaire

Brad asked for "all the questions up front." Here they are, grouped by tab. **You do not
have to answer these in chat** — I'm creating a Google Sheet ("Personal Dashboard Data")
with a fillable row for each item, and I'll pre-fill as much as I can from your Gmail/Drive
and the Personal-OS `brain/` files. This doc is the human-readable companion so you can
jot answers on your phone while you're out if you like. Anything left blank just shows an
empty state until filled.

Legend: ⭐ = most useful to answer first.

---

## Global / Config
- ⭐ Password to gate the dashboard? (default provided in the Sheet — change if you want)
- Dashboard title / greeting (e.g. "Brad's Life OS")?
- Anyone else who should have the password (spouse)?

## Overview / Home
- What are the 4–6 numbers you most want to see the instant you open it?
  (e.g. total monthly bills, budget left this month, next flight lesson, net worth,
  next big renewal due, days to next trip)
- Any "next actions" you always want surfaced?

## Home & Bills  ⭐ (I'll pre-draft from Gmail/Drive)
For each recurring bill / service / subscription:
- Vendor/service name · category (utilities, insurance, streaming, phone, internet, etc.)
- Amount · frequency (monthly/annual/quarterly) · autopay? · payment method
- Renewal / due date · account #/login (store login? or just note "in 1Password"?)
- ⭐ Contact info to click-to-call: phone, support URL, account rep name
- Notes (contract end, price-lock expiry, "shop this one")
Questions:
- Which utilities/services do you use and who's the provider? (power, gas, water, trash,
  internet, cell, streaming, security/alarm, lawn/pool, HOA, insurance x[home/auto/life/umbrella])
- Home warranty or service contracts?
- Anything you're actively trying to cut or renegotiate?

## Projects (house & family)
For each project:
- Name · area (house/yard/family/personal) · status (idea/planning/active/blocked/done)
- Priority · target date · budget · spent · who's doing it (DIY/contractor + contact)
- Tasks/checklist · notes/links (inspiration, quotes)
Questions:
- ⭐ What projects are active or on the near-term list right now?
- Any contractors/vendors you'd want saved with contact info?
- Do you want a "someday/wishlist" bucket too?

## Flying  ⭐ (pre-filled from brain/domains/flight.md — confirm/expand)
- Rating you're working toward (PPL/IR/…)? Current stage?
- Aircraft you train in · tail number(s)?
- Home airport + training area?
- Which mornings you fly (profile says Tue & Sat, sometimes Fri)?
- Total hours / dual / solo / XC / night / instrument?
- Weak areas your CFI flagged · next lesson focus?
- Written/knowledge test status · checkride target date?
- Track: logbook hours, endorsements, $ spent on training, study topics?
- CFI name + contact to save?

## Money & Budget  ⭐
- **Existing budget sheet:** you have one in another Google account — share it with
  brad@lschurches.com (Viewer) and paste the link, or set it link-viewable. Keep it as
  the live source, or consolidate into the master sheet? (recommend: keep it live)
- Budget categories & monthly targets (housing, food, transport, giving/tithe, insurance,
  kids, fun, savings, etc.)?
- Accounts to show (checking/savings/credit — name + rough balance, or link a source)?
- Debts: mortgage (balance, rate, payment — brain has refi params), auto, student, cards?
- Investments: brokerage, retirement, **bitcoin holdings** (you noted ~$300k BTC changes
  risk capacity) — show current value / cost basis?
- Savings goals (name, target $, current $, target date)?
- Should I show spend charts by month/category? Net worth over time?
- OPTIONAL: authorize the **Ramp** connector for live transactions?

## Hobbies
- ⭐ What are your (and the family's) hobbies/activities? For each:
  - Name · who does it · cadence · gear/equipment owned · a goal or current focus
  - Any log you want (rounds, rides, catches, books read, etc.)?
  - Budget/spend for it?
- Want a "want to try" list?

## Vehicles & Maintenance
For each vehicle:
- Year/make/model · nickname · VIN (optional) · plate · current mileage
- Registration renewal date · insurance (provider, policy #, renewal, cost)
- Service history (date, mileage, service, cost, shop) · upcoming/next service due
- Loan (if any) — ties to Money tab
Questions:
- ⭐ Which vehicles? Any you want maintenance reminders for?
- Preferred shop/mechanic contact to save?

## Health & Fitness  (pulls from Personal-OS: Whoop + training)
- Confirm: mirror the Personal-OS fitness data here, or track something different?
- Metrics to show (recovery, sleep, weight, runs/rides/lifts, PRs)?
- Current program/block (brain/domains/fitness.md is currently a template — paste it)?
- Any appointments/health admin to track (doctor, dentist, meds, insurance)?

## Travel & Trips  (can pull from Google Calendar)
- ⭐ Any upcoming trips? (destination, dates, purpose, who's going)
- Standing travel checklists (packing, pre-trip house tasks)?
- Points/miles programs to track (airline, hotel, card)?
- Family travel wishlist / bucket list?
- Should I read your Google Calendar to auto-surface upcoming travel?

---

### Things only you can do (so the build never stalls) — see SETUP.md
1. Authorize + deploy the Apps Script as a Web App, paste the `/exec` URL into the Sheet.
2. Confirm the dashboard password.
3. Flip GitHub Pages source to "GitHub Actions" if it isn't automatic (1 click).
4. Share the external budget sheet (link above) if you want the Money tab wired to it.
5. OPTIONAL: authorize Ramp for live spend.
