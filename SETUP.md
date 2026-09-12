# Life OS — Personal Setup

Goal: everything runs under **your personal accounts**, not the church ones. This repo is
self-contained (site + Apps Script + docs). Do these in order.

## 1. Make it your repo (off LSSouthReno)
1. Create a personal GitHub account if you haven't: https://github.com/join
2. On this repo (currently `LSSouthReno/Personal-Dashboard`): **Settings → Danger Zone →
   Transfer ownership** → enter your personal username. Accept the transfer on that account.
   Everything here (site, Apps Script, docs, history) moves with it. Nothing personal is in
   these files — the site is just the shell; your data lives only in your Google account (below).
3. New site URL will be **`https://<your-username>.github.io/Personal-Dashboard/`**.

## 2. Turn the site on
Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**. Within ~15 min
the scheduled workflow publishes the site. (Nothing else — no build.)

## 3. Your data — under your PERSONAL Google account
Sign into your **personal** Google account first (not lschurches.com), then:
1. Create a new blank Google Sheet ("Life OS Data").
2. **Extensions → Apps Script.** Paste the contents of **`apps-script/Code_personal_dashboard.gs`**
   (in this repo). Save. Run **`setup`** → approve the authorization prompt. Builds all tabs.
3. Paste the private **`seedData.gs`** the assistant sent you (kept out of GitHub) BELOW that
   code, run **`seedData`** once → pre-fills your real data.
4. In the sheet's **Config** tab, change `password` from `changeme` to a real password.
5. **Deploy → New deployment → Web app** (Execute as: Me, Access: Anyone) → copy the `/exec` URL.
6. Open your published dashboard, paste that URL once + your password.

Re-deploy a new version in Apps Script whenever you change the script code (not for data edits).

## Notes
- The site page holds **no personal data** — it fetches from your private Apps Script at
  runtime, gated by your password. Keep the `/exec` URL + password to yourself.
- `docs/` has the full build plan and the intake questionnaire (question list per tab).
