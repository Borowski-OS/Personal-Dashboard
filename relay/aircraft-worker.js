// Aircraft relay for the Life OS Flying tab ("Who's flying").
//
// The dashboard asks this Cloudflare Worker about a few tail numbers; the Worker asks
// FlightAware AeroAPI (Personal plan) and hands back where each plane is, where it's
// headed and when it lands. (The free ADS-B feeds block Cloudflare's servers.)
//
//   GET /aircraft?tails=N51207,N6058A  ->  { ok, now, budget, capped, planes: [...] }
//
// Cost control:
//   - flight status per plane at most every 5 min; position for planes in the air at most every 60 s
//   - a parked plane's last reported spot is looked up once per finished flight (airport location as fallback)
//   - answers are shared through KV, so several open screens cost the same as one
//   - a monthly spending cap (MONTHLY_CAP_USD); past it the Worker only serves what it already has
//   - nothing runs unless the Flying tab is open somewhere
// Secrets: AEROAPI_KEY (wrangler secret). Storage: STATE (KV).

const AERO = "https://aeroapi.flightaware.com/aeroapi";
const PRICE = { status: 0.005, position: 0.01, airport: 0.015 };   // USD per call, rounded up from FlightAware's list
const STATUS_TTL = 300;
const POSITION_TTL = 60;
const FOREVER = 365 * 86400;   // a finished flight's last spot and an airport's location never change

const ALLOWED_ORIGINS = [
  /^https:\/\/borowski-os\.github\.io$/i,
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
    if (req.method !== "GET" || url.pathname !== "/aircraft") return json({ ok: false, error: "not_found" }, 404, cors);

    const tails = [...new Set((url.searchParams.get("tails") || "").toUpperCase().split(",")
      .map((t) => t.trim()).filter((t) => /^N[0-9A-Z]{1,5}$/.test(t)))].slice(0, 10);
    if (!tails.length) return json({ ok: false, error: "no_tails" }, 400, cors);
    if (!env.AEROAPI_KEY) return json({ ok: false, error: "no_key" }, 503, cors);

    const cap = Number(env.MONTHLY_CAP_USD) || 5;
    const monthKey = "spend:" + new Date().toISOString().slice(0, 7);
    const spentBefore = Number(await env.STATE.get(monthKey)) || 0;
    let spentNow = 0;
    let capped = false;
    const errors = [];

    async function aero(path, kind) {
      if (spentBefore + spentNow + PRICE[kind] > cap) { capped = true; return undefined; }
      spentNow += PRICE[kind];   // counted before the await so parallel lookups respect the cap
      const r = await fetch(AERO + path, { headers: { "x-apikey": env.AEROAPI_KEY, Accept: "application/json" } });
      if (!r.ok) throw new Error("FlightAware HTTP " + r.status);
      return r.json();
    }

    // Serve from KV while fresh; otherwise ask FlightAware (if the budget allows) and store the trimmed answer.
    async function cached(key, ttl, path, kind, trim) {
      const hit = await env.STATE.get(key, "json");
      const now = Date.now() / 1000;
      if (hit && now - hit.at < ttl) return hit.v;
      let raw;
      try { raw = await aero(path, kind); } catch (e) { errors.push(e.message); }
      if (raw === undefined) return hit ? hit.v : null;
      const v = trim(raw);
      ctx.waitUntil(env.STATE.put(key, JSON.stringify({ at: now, v }), { expirationTtl: Math.max(7 * 86400, ttl) }));
      return v;
    }

    const planes = await Promise.all(tails.map(async (tail) => {
      const flight = await cached("status:" + tail, STATUS_TTL, "/flights/" + tail + "?max_pages=1", "status",
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
      budget: { spent: Math.round((spentBefore + spentNow) * 100) / 100, cap },
      errors: errors.slice(0, 3),
      planes,
    }, 200, cors);
  },
};
