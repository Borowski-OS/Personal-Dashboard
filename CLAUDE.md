# Life OS dashboard — notes for Claude sessions

- `index.html` in this repo IS the dashboard page and the source of truth. Edit it here and push to `main`;
  the Pages workflow publishes it. No Google sign-in is needed for page changes.
- The Apps Script's `syncSite()` is disabled on purpose (it used to overwrite index.html with its own copy). Don't re-enable it.
- Data lives in Brad's Life OS Google Sheet and is read/written through the Apps Script web app
  (password-gated JSONP). Backend (Code.js) changes are rare and need clasp.
- This repo is PUBLIC. Never commit data.js, Code.js, .clasprc.json, passwords, or personal financial data.
- Brad doesn't code: work autonomously, explain in plain English, and only ask for things only he can do.
