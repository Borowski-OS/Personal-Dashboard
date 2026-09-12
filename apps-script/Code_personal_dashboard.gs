/**
 * Personal Dashboard — data layer (Google Apps Script Web App)
 * ============================================================
 * Brad's personal life dashboard. This script is the ONLY place personal data
 * is exposed, and only to someone who knows the password. The GitHub Pages site
 * (index.html) contains NO personal data — it fetches everything from here at
 * runtime, gated by a password.
 *
 * SECURITY MODEL (be honest with yourself about this):
 *   - The page asks for a password, SHA-256 hashes it in the browser, and sends
 *     ONLY the hash to this web app. This script compares it to the SHA-256 of the
 *     password stored in the private "Config" sheet. Wrong hash -> no data.
 *   - This is a *convenience gate*, not bank-grade auth: the hash rides in the URL,
 *     and anyone with the deployed /exec URL + the password can read the data.
 *     Keep the URL private and use a real password. Nothing sensitive is ever in git.
 *
 * SETUP (see SETUP.md for the click-by-click version):
 *   1. Create a blank Google Sheet. Extensions > Apps Script. Paste this file.
 *   2. Run `setup()` once (authorize when prompted). It builds every tab + headers,
 *      and pre-fills the non-sensitive structure (categories, tab scaffolding).
 *   3. Put your data in the sheet tabs. Set your password in the Config tab.
 *   4. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 *      Copy the /exec URL and paste it into index.html (DASHBOARD_API) — or into the
 *      Config tab cell `webapp_url` and tell the assistant.
 *   5. Re-deploy (new version) whenever you change this code.
 *
 * The data contract (tab name -> columns) lives in SCHEMA below and is shared by
 * setup() and doGet(); index.html renders whatever these return.
 */

/* ------------------------------------------------------------------ *
 *  SCHEMA — the single source of truth for tabs + columns.
 *  Two shapes:
 *    'table' : header row + many data rows -> returned as array of row objects.
 *    'kv'    : two columns [Key, Value] -> returned as a single object.
 * ------------------------------------------------------------------ */
var SCHEMA = {
  Config: { type: 'kv', seed: [
    ['dashboard_title', "Brad's Life OS"],
    ['owner_name', 'Brad Borowski'],
    ['password', 'changeme'],           // <-- CHANGE THIS. Plaintext lives only here (private sheet).
    ['webapp_url', ''],                  // optional: paste the deployed /exec URL here for reference
    ['updated_note', 'Edit any tab; the dashboard refreshes within ~1 min.']
  ]},

  // Overview: manual "hero" numbers + next actions. Auto KPIs are also computed in the page.
  Highlights: { type: 'table',
    cols: ['Label', 'Value', 'Sub', 'Tab', 'Order'],
    seed: [
      ['Monthly bills', '', 'auto-calculated if blank', 'bills', '1'],
      ['Budget left this month', '', 'auto if blank', 'money', '2'],
      ['Net worth', '', 'from Accounts/Investments', 'money', '3'],
      ['Next flight', '', 'next FlightLog / lesson', 'flying', '4']
    ]},
  NextActions: { type: 'table', cols: ['Action', 'Tab', 'Due', 'Done'], seed: [] },

  // Home & Bills
  Bills: { type: 'table',
    cols: ['Vendor', 'Category', 'Amount', 'Frequency', 'Autopay', 'DueDay',
           'PaymentMethod', 'Phone', 'URL', 'Account', 'Personal', 'Notes'],
    seed: [] },

  Contacts: { type: 'table',
    cols: ['Name', 'Company', 'Category', 'Phone', 'Email', 'URL', 'Notes'],
    seed: [] },

  // Money & Budget
  BudgetCategories: { type: 'table',
    cols: ['Category', 'Type', 'MonthlyBudget', 'MonthlyActual', 'Notes'],
    seed: [
      ['Housing / Mortgage', 'Needs', '', '', ''],
      ['Giving / Tithe', 'Tithe', '', '', ''],
      ['Groceries', 'Needs', '', '', ''],
      ['Utilities', 'Needs', '', '', ''],
      ['Insurance', 'Needs', '', '', ''],
      ['Transportation', 'Needs', '', '', ''],
      ['Flying', 'Wants', '', '', ''],
      ['Restaurants / Date Night', 'Wants', '', '', ''],
      ['Travel', 'Wants', '', '', ''],
      ['Savings', 'Savings', '', '', ''],
      ['Retirement / ROTH', 'Savings', '', '', ''],
      ['Investing / Bitcoin', 'Savings', '', '', '']
    ]},
  Accounts: { type: 'table',
    cols: ['Name', 'Institution', 'Type', 'Last4', 'Balance', 'AsOf', 'Notes'],
    seed: [] },
  Debts: { type: 'table',
    cols: ['Name', 'Lender', 'Type', 'Balance', 'Rate', 'Payment', 'DueDay', 'Property', 'Notes'],
    seed: [] },
  Investments: { type: 'table',
    cols: ['Name', 'Type', 'Value', 'CostBasis', 'AsOf', 'Notes'],
    seed: [] },
  SavingsGoals: { type: 'table',
    cols: ['Goal', 'Target', 'Current', 'TargetDate', 'Notes'],
    seed: [] },
  NetWorthHistory: { type: 'table',
    cols: ['Date', 'NetWorth', 'Notes'],
    seed: [] },

  // Projects (house & family)
  Projects: { type: 'table',
    cols: ['Name', 'Area', 'Status', 'Priority', 'Budget', 'Spent', 'Owner', 'TargetDate', 'Notes'],
    seed: [] },
  ProjectTasks: { type: 'table',
    cols: ['Project', 'Task', 'Done', 'Due', 'Notes'], seed: [] },

  // Flying
  Flying: { type: 'kv', seed: [
    ['rating_goal', ''],
    ['stage', ''],
    ['home_airport', ''],
    ['training_area', ''],
    ['fly_days', 'Tue & Sat, sometimes Fri'],
    ['total_hours', ''],
    ['dual_hours', ''],
    ['solo_hours', ''],
    ['xc_hours', ''],
    ['written_status', ''],
    ['checkride_target', ''],
    ['cfi_name', ''],
    ['cfi_phone', ''],
    ['weak_areas', ''],
    ['next_lesson_focus', '']
  ]},
  Aircraft: { type: 'table',
    cols: ['Tail', 'MakeModel', 'Owner', 'HomeField', 'Insurer', 'AnnualDue', 'Notes'],
    seed: [] },
  FlightLog: { type: 'table',
    cols: ['Date', 'Aircraft', 'Route', 'Hours', 'Type', 'Notes'], seed: [] },

  // Hobbies
  Hobbies: { type: 'table',
    cols: ['Name', 'Who', 'Cadence', 'Gear', 'Goal', 'Budget', 'Log', 'Notes'],
    seed: [] },

  // Vehicles
  Vehicles: { type: 'table',
    cols: ['Name', 'Year', 'Make', 'Model', 'Plate', 'Mileage', 'RegRenewal',
           'InsProvider', 'InsRenewal', 'LoanBalance', 'Notes'],
    seed: [] },
  VehicleService: { type: 'table',
    cols: ['Vehicle', 'Date', 'Mileage', 'Service', 'Cost', 'Shop', 'NextDue', 'Notes'],
    seed: [] },

  // Health & Fitness (mirror Personal-OS if desired)
  Health: { type: 'kv', seed: [
    ['program', ''],
    ['weekly_shape', 'Mon long run · Thu lift · Fri lift/bike · Sat long bike · rest Sun/Wed'],
    ['weight', ''],
    ['resting_hr', ''],
    ['recovery_note', ''],
    ['next_appointment', '']
  ]},
  HealthLog: { type: 'table',
    cols: ['Date', 'Metric', 'Value', 'Notes'], seed: [] },

  // Travel
  Travel: { type: 'table',
    cols: ['Trip', 'Destination', 'StartDate', 'EndDate', 'Purpose', 'Who', 'Status', 'Notes'],
    seed: [] },
  TravelChecklist: { type: 'table',
    cols: ['Trip', 'Item', 'Done', 'Notes'], seed: [] },
  Points: { type: 'table',
    cols: ['Program', 'Type', 'Number', 'Balance', 'Notes'], seed: [] }
};

/* ------------------------------------------------------------------ *
 *  setup() — build all tabs + headers + non-sensitive seed structure.
 *  Safe to re-run: it won't wipe tabs that already have data rows.
 * ------------------------------------------------------------------ */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SCHEMA).forEach(function (name) {
    var def = SCHEMA[name];
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    var hasData = sh.getLastRow() > (def.type === 'kv' ? 0 : 1);
    if (def.type === 'kv') {
      if (sh.getLastRow() === 0) {
        sh.getRange(1, 1, 1, 2).setValues([['Key', 'Value']]).setFontWeight('bold');
      }
      if (!hasData && def.seed && def.seed.length) {
        sh.getRange(2, 1, def.seed.length, 2).setValues(def.seed);
      }
    } else {
      sh.getRange(1, 1, 1, def.cols.length).setValues([def.cols]).setFontWeight('bold');
      sh.setFrozenRows(1);
      if (!hasData && def.seed && def.seed.length) {
        sh.getRange(2, 1, def.seed.length, def.cols.length).setValues(def.seed);
      }
    }
  });
  // Drop the default "Sheet1" if it's empty and unused.
  var s1 = ss.getSheetByName('Sheet1');
  if (s1 && ss.getSheets().length > 1 && s1.getLastRow() === 0) ss.deleteSheet(s1);
  SpreadsheetApp.getActive().toast('Personal Dashboard tabs are ready. Fill them in, then deploy the web app.');
}

/* ------------------------------------------------------------------ *
 *  doGet — the gated JSON API.
 *    ?pw=<sha256 of password>       required
 *    ?callback=<fn>                 optional (JSONP for cross-origin from GitHub Pages)
 *    ?tab=<Name>                    optional (default: all tabs)
 * ------------------------------------------------------------------ */
function doGet(e) {
  var p = (e && e.parameter) || {};
  var out;
  try {
    if (!checkAuth_(p.pw)) {
      out = { ok: false, error: 'unauthorized' };
    } else {
      out = { ok: true, updated: new Date().toISOString(), data: readAll_(p.tab) };
    }
  } catch (err) {
    out = { ok: false, error: String(err) };
  }
  var json = JSON.stringify(out);
  if (p.callback) {
    return ContentService
      .createTextOutput(p.callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function checkAuth_(providedHash) {
  if (!providedHash) return false;
  var stored = getConfigValue_('password') || '';
  if (!stored) return false;
  return String(providedHash).toLowerCase() === sha256_(stored);
}

function getConfigValue_(key) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
  if (!sh || sh.getLastRow() < 2) return '';
  var vals = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0]).trim() === key) return String(vals[i][1]);
  }
  return '';
}

// Read one tab (or all). Config's `password` is NEVER returned.
function readAll_(only) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var res = {};
  Object.keys(SCHEMA).forEach(function (name) {
    if (only && only !== name) return;
    var def = SCHEMA[name];
    var sh = ss.getSheetByName(name);
    if (!sh) { res[name] = def.type === 'kv' ? {} : []; return; }
    if (def.type === 'kv') {
      var obj = {};
      if (sh.getLastRow() >= 2) {
        sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) {
          var k = String(r[0]).trim();
          if (k && !(name === 'Config' && k === 'password')) obj[k] = r[1];
        });
      }
      res[name] = obj;
    } else {
      var rows = [];
      if (sh.getLastRow() >= 2) {
        var cols = def.cols;
        sh.getRange(2, 1, sh.getLastRow() - 1, cols.length).getValues().forEach(function (r) {
          if (r.every(function (c) { return c === '' || c === null; })) return; // skip blank rows
          var o = {};
          cols.forEach(function (c, i) { o[c] = r[i]; });
          rows.push(o);
        });
      }
      res[name] = rows;
    }
  });
  return res;
}

function sha256_(str) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  return bytes.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}
