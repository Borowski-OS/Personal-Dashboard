// Aircraft relay for the Life OS Flying tab ("Who's flying").
//
// The dashboard asks this Cloudflare Worker about a few tail numbers; the Worker asks
// FlightAware AeroAPI (Personal plan) and hands back where each plane is, where it's
// headed and when it lands. (The free ADS-B feeds block Cloudflare's servers.)
//
//   GET /aircraft?tails=N51207,N6058A[&fresh=1]  ->  { ok, now, budget, capped, planes: [...] }
//
// Cost control ("fresh when you look, slow while idle"):
//   - fresh=1 (the page sends it when someone opens or returns to the Flying tab): status no older than 2 min
//   - while the tab just sits open: parked planes every 20 min (stretched toward 60 min if the month's
//     spending runs ahead of pace), planes in the air or about to depart every 5 min
//   - position for planes in the air at most every 60 s
//   - a parked plane's last reported spot is looked up once per finished flight (airport location as fallback)
//   - answers are shared through KV, so several open screens cost the same as one
//   - a monthly spending cap (MONTHLY_CAP_USD); past it the Worker only serves what it already has
//   - nothing runs unless the Flying tab is open somewhere
//   - overnight quiet window (QUIET_START..QUIET_END Pacific): no FlightAware calls, stored answers only
//   - planes in the air: status + position every 15 min; parked planes: status about once an hour
// Secrets: AEROAPI_KEY (wrangler secret). Storage: STATE (KV).

const AERO = "https://aeroapi.flightaware.com/aeroapi";
const PRICE = { status: 0.005, position: 0.01, airport: 0.015, track: 0.01 };   // USD per call, rounded up from FlightAware's list
const STATUS_FRESH_TTL = 120;   // someone just looked: never show them anything older than this
const STATUS_AIR_TTL = 840;     // in the air or departing within the hour: every 15 min (14 so a 15-min poller never reads a stale answer)
const STATUS_IDLE_TTL = 3500;   // parked: checked about once an hour
const STATUS_IDLE_MAX = 3600;   // ...stretched up to this when spending runs ahead of the monthly pace
const POSITION_TTL = 840;       // positions only ever fetched for planes in the air, every 15 min
const FOREVER = 365 * 86400;   // a finished flight's last spot and an airport's location never change

const ALLOWED_ORIGINS = [
  /^https:\/\/borowski-os\.github\.io$/i,
  /^https:\/\/([a-z0-9-]+\.)?freedom-air[a-z0-9-]*\.pages\.dev$/i,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

function corsHeaders(req) {
  const origin = req.headers.get("Origin") || "";
  return ALLOWED_ORIGINS.some((r) => r.test(origin))
    ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
    : {};
}

function json(body, status, extra) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra },
  });
}

// Overnight quiet window (Pacific, from QUIET_START / QUIET_END in wrangler.toml, "HH:MM"): no FlightAware calls at all,
// only what is already stored is served. Set QUIET_START = QUIET_END (or empty) to turn it off.
function inQuiet(env, at) {
  const a = String(env.QUIET_START || ""), b = String(env.QUIET_END || "");
  if (!a || !b || a === b) return false;
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: env.QUIET_TZ || "America/Los_Angeles", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(at || new Date());
  const now = p.find((x) => x.type === "hour").value + ":" + p.find((x) => x.type === "minute").value;
  return a < b ? now >= a && now < b : now >= a || now < b;
}

const code = (ap) => (ap && (ap.code_icao || ap.code || ap.code_lid)) || null;
const ts = (s) => (s ? Date.parse(s) / 1000 : null);

// The flight that matters now: in the air > most recent departure > next scheduled.
function pickFlight(flights) {
  const live = flights.filter((f) => f.actual_off && !f.actual_on && !f.cancelled);
  if (live.length) return live[0];
  const done = flights.filter((f) => f.actual_off);
  if (done.length) return done.reduce((a, b) => ((a.actual_off || "") > (b.actual_off || "") ? a : b));
  const next = flights.filter((f) => !f.cancelled);
  return next.length
    ? next.reduce((a, b) => ((a.scheduled_out || a.scheduled_off || "~") < (b.scheduled_out || b.scheduled_off || "~") ? a : b))
    : null;
}

function trimFlight(f) {
  if (!f) return null;
  const departed = ts(f.actual_off || f.actual_out);
  const landed = ts(f.actual_on || f.actual_in);
  return {
    id: f.fa_flight_id,
    status: f.status || "",
    progress: f.progress_percent,
    origin: code(f.origin), originName: f.origin && f.origin.name,
    destination: code(f.destination), destinationName: f.destination && f.destination.name,
    departed, landed,
    eta: ts(f.estimated_on || f.estimated_in),
    etd: ts(f.estimated_off || f.scheduled_off || f.estimated_out || f.scheduled_out),
    type: f.aircraft_type || "",
    enroute: !!(departed && !landed && !f.cancelled),
    diverted: !!f.diverted,
  };
}

function trimPosition(d) {
  const p = d && d.last_position;
  if (!p || typeof p.latitude !== "number") return null;
  return {
    lat: p.latitude, lon: p.longitude,
    alt: (p.altitude || 0) * 100, gs: p.groundspeed, track: p.heading,
    climb: p.altitude_change, ts: ts(p.timestamp), update: p.update_type,
  };
}

export default {
  async fetch(req, env, ctx) {
    const cors = corsHeaders(req);
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { ...cors, "Access-Control-Allow-Methods": "GET", "Access-Control-Max-Age": "86400" },
      });
    }
    const url = new URL(req.url);

    // Private in-network provider index for the Health tab's "Find care" (parsed from the Hometown Health directory).
    // Stored in KV as care:providers (JSON text) + care:etag; served only with the CARE_KEY secret (Config key care_key in the sheet).
    if (req.method === "GET" && url.pathname === "/care") {
      const k = url.searchParams.get("k") || "";
      if (!env.CARE_KEY || k.length !== env.CARE_KEY.length || k !== env.CARE_KEY) return json({ ok: false, error: "forbidden" }, 403, cors);
      const etag = (await env.STATE.get("care:etag")) || "";
      const h = { ...cors, "Cache-Control": "private, max-age=86400", ETag: etag ? '"' + etag + '"' : undefined };
      if (etag && req.headers.get("If-None-Match") === '"' + etag + '"') return new Response(null, { status: 304, headers: h });
      const body = await env.STATE.get("care:providers");
      if (!body) return json({ ok: false, error: "no_index" }, 503, cors);
      return new Response(body, { status: 200, headers: { ...h, "Content-Type": "application/json" } });
    }

    const isHist = url.pathname === "/history";
    if (req.method !== "GET" || (url.pathname !== "/aircraft" && !isHist)) return json({ ok: false, error: "not_found" }, 404, cors);

    const tails = [...new Set((url.searchParams.get("tails") || "").toUpperCase().split(",")
      .map((t) => t.trim()).filter((t) => /^N[0-9A-Z]{1,5}$/.test(t)))].slice(0, 10);
    if (!tails.length) return json({ ok: false, error: "no_tails" }, 400, cors);
    if (!env.AEROAPI_KEY) return json({ ok: false, error: "no_key" }, 503, cors);

    const cap = Number(env.MONTHLY_CAP_USD) || 5;
    const monthKey = "spend:" + new Date().toISOString().slice(0, 7);
    const spentBefore = Number(await env.STATE.get(monthKey)) || 0;
    const fresh = url.searchParams.get("fresh") === "1";

    // Ahead of an even spend across the month (plus 50¢ of slack)? Stretch idle lookups for parked planes.
    const d0 = new Date(), m0 = Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth(), 1), m1 = Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + 1, 1);
    const pace = spentBefore / (cap * (Date.now() - m0) / (m1 - m0) + 0.5);
    const idleTtl = Math.round(Math.min(STATUS_IDLE_MAX, STATUS_IDLE_TTL * Math.max(1, pace)));
    function statusTtl(hit) {
      if (fresh) return STATUS_FRESH_TTL;
      const f = hit && hit.v;
      const soon = f && !f.departed && f.etd && f.etd - Date.now() / 1000 < 3600 && f.etd - Date.now() / 1000 > -3600;
      return f && (f.enroute || soon) ? STATUS_AIR_TTL : idleTtl;
    }
    let spentNow = 0;
    let capped = false;
    const sleeping = inQuiet(env, env.QUIET_NOW ? new Date(env.QUIET_NOW) : undefined);
    const errors = [];

    async function aero(path, kind) {
      if (sleeping) return undefined;   // overnight: zero upstream calls
      if (spentBefore + spentNow + PRICE[kind] > cap) { capped = true; return undefined; }
      spentNow += PRICE[kind];   // counted before the await so parallel lookups respect the cap
      const r = await fetch(AERO + path, { headers: { "x-apikey": env.AEROAPI_KEY, Accept: "application/json" } });
      if (!r.ok) { const e = new Error("FlightAware HTTP " + r.status + " " + path.split("?")[0]); e.status = r.status; throw e; }
      return r.json();
    }

    // Serve from KV while fresh; otherwise ask FlightAware (if the budget allows) and store the trimmed answer.
    // ttl may be a function of the cached entry (status lookups depend on whether the plane is flying).
    async function cached(key, ttl, path, kind, trim) {
      const hit = await env.STATE.get(key, "json");
      const now = Date.now() / 1000;
      if (typeof ttl === "function") ttl = ttl(hit);
      if (hit && now - hit.at < ttl) return hit.v;
      let raw;
      try { raw = await aero(path, kind); } catch (e) {
        errors.push(e.message);
        // Remember the failure so it isn't re-asked (and re-billed) on every poll: a 4xx for this entry's
        // full ttl (capped at a day), a rate limit or server error for 5 min.
        const hold = e.status >= 400 && e.status < 500 && e.status !== 429 ? Math.min(ttl, 86400) : 300;
        ctx.waitUntil(env.STATE.put(key, JSON.stringify({ at: now - ttl + hold, v: hit ? hit.v : null }),
          { expirationTtl: Math.max(7 * 86400, ttl) }));
        return hit ? hit.v : null;
      }
      if (raw === undefined) return hit ? hit.v : null;
      const v = trim(raw);
      ctx.waitUntil(env.STATE.put(key, JSON.stringify({ at: now, v }), { expirationTtl: Math.max(7 * 86400, ttl) }));
      return v;
    }

    // GET /history?tails=..&start=<unix>&end=<unix>  ->  today's real flown paths per tail (FlightAware flights + tracks).
    // Finished flights' tracks are kept in KV for good, so each is paid for once. Window limited to the last 3 days.
    if (isHist) {
      const nowS = Date.now() / 1000;
      const start = Math.max(Number(url.searchParams.get("start")) || nowS - 86400, nowS - 3 * 86400);
      const end = Math.min(Number(url.searchParams.get("end")) || nowS, nowS + 3600);
      const iso = (t) => new Date(t * 1000).toISOString().replace(/\.\d+Z$/, "Z");
      const out = await Promise.all(tails.map(async (tail) => {
        let list = [];
        try {
          const d = await aero("/flights/" + tail + "?start=" + iso(start) + "&end=" + iso(end) + "&max_pages=1", "status");
          list = ((d && d.flights) || []).filter((f) => f.actual_off && !f.cancelled);
        } catch (e) { errors.push(e.message); }
        const flights = await Promise.all(list.map(async (f) => {
          const dep = ts(f.actual_off), arr = ts(f.actual_on);
          const pts = await cached("track:" + f.fa_flight_id, arr ? FOREVER : 120, "/flights/" + encodeURIComponent(f.fa_flight_id) + "/track", "track",
            (r) => ((r && r.positions) || []).filter((q) => typeof q.latitude === "number")
              .map((q) => [Math.round(q.latitude * 1e4) / 1e4, Math.round(q.longitude * 1e4) / 1e4, Math.round(ts(q.timestamp))]));
          return { id: f.fa_flight_id, origin: code(f.origin), destination: code(f.destination), departed: dep, landed: arr, points: pts || [] };
        }));
        return { tail, flights };
      }));
      if (spentNow > 0) ctx.waitUntil(env.STATE.put(monthKey, String(Math.round((spentBefore + spentNow) * 1000) / 1000)));
      return json({ ok: true, source: "FlightAware", now: nowS, capped, sleeping, errors, start, end, planes: out }, 200, cors);
    }

    const planes = await Promise.all(tails.map(async (tail) => {
      const flight = await cached("status:" + tail, statusTtl, "/flights/" + tail + "?max_pages=1", "status",
        (d) => trimFlight(pickFlight((d && d.flights) || [])));
      let pos = null;
      let last = null;
      if (flight && flight.enroute && flight.id) {
        pos = await cached("pos:" + flight.id, POSITION_TTL, "/flights/" + encodeURIComponent(flight.id) + "/position", "position",
          trimPosition);
      } else if (flight && flight.id && flight.departed) {
        // Parked: where the last flight ended. One lookup per finished flight, kept for good.
        last = await cached("last:" + flight.id, FOREVER, "/flights/" + encodeURIComponent(flight.id) + "/position", "position",
          trimPosition);
        if (!last && /^[A-Z0-9]{3,4}$/.test(flight.destination || "")) {
          const ap = await cached("apt:" + flight.destination, FOREVER, "/airports/" + flight.destination, "airport",
            (d) => (d && typeof d.latitude === "number" ? { lat: d.latitude, lon: d.longitude } : null));
          if (ap) last = { lat: ap.lat, lon: ap.lon, alt: 0, gs: 0, track: 0, ts: flight.landed, airport: true };
        }
      }
      return { tail, flight, pos, last };
    }));

    if (spentNow > 0) ctx.waitUntil(env.STATE.put(monthKey, String(Math.round((spentBefore + spentNow) * 1000) / 1000)));

    return json({
      ok: true,
      source: "FlightAware",
      now: Date.now() / 1000,
      capped,
      sleeping,
      budget: { spent: Math.round((spentBefore + spentNow) * 100) / 100, cap, idleMin: Math.round(idleTtl / 60) },
      errors: errors.slice(0, 3),
      planes,
    }, 200, cors);
  },
};
