# Life OS — Personal Dashboard

A single static page (`index.html`) served by GitHub Pages. It contains **no personal
data**. On load it asks for a password, then fetches everything at runtime from a private
Google Apps Script web app backed by a Google Sheet. Nothing sensitive is ever committed.

- **Data entry:** a Google Sheet (tabs: Bills, Accounts, Debts, Investments, Projects,
  Flying, Hobbies, Vehicles, Travel, Health, …).
- **Data API:** a Google Apps Script web app (`Code_personal_dashboard.gs`) that serves
  gated JSON. See `SETUP.md` in the Personal-OS repo (`dashboard/`) for setup.
- **Aesthetic:** modeled on the church dashboard — dark, Montserrat, card grid, Chart.js.

## How it fits together
```
Google Sheet  ->  Apps Script web app (doGet, password-gated)  ->  index.html (this page)
   you edit          serves JSON only to the right password         fetches at runtime
```
