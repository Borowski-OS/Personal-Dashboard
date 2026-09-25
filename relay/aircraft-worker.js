// Aircraft position relay for the Life OS Flying tab ("Who's flying").
//
// The free ADS-B feeds don't allow browser pages to call them directly (no CORS),
// so the dashboard asks this Cloudflare Worker, which fetches the feed and hands
// back only the fields the map needs. No keys, no personal data: the page sends
// the transponder (ICAO hex) codes it wants, at most 20 at a time.
//
//   GET /aircraft?hex=a66b55,a7dd43  ->  { ok, source, now, ac: [...] }
//
// Responses are cached for a few seconds so several open tabs share one upstream call.

const FEEDS = [
  "https://opendata.adsb.fi/api/v2/hex/",
  "https://api.adsb.lol/v2/hex/",
];

const ALLOWED_ORIGINS = [
  /^https:\/\/borowski-os\.github\.io$/i,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

const KEEP = [
  "hex", "r", "t", "desc", "flight", "alt_baro", "alt_geom", "gs", "track",
  "baro_rate", "geom_rate", "squawk", "emergency", "lat", "lon", "seen", "seen_pos",
  "nav_altitude_mcp", "category",
];

const CACHE_SECONDS = 8;

function corsHeaders(req) {
  const origin = req.headers.get("Origin") || "";
  return ALLOWED_ORIGINS.some((r) => r.test(origin))
    ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
    : {};
}

function json(body, status, extra) {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra },
  });
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
    if (req.method !== "GET" || url.pathname !== "/aircraft") {
      return json({ ok: false, error: "not_found" }, 404, cors);
    }

    const hexes = [...new Set(
      (url.searchParams.get("hex") || "").toLowerCase().split(",")
        .map((h) => h.trim())
        .filter((h) => /^[0-9a-f]{6}$/.test(h)),
    )].sort().slice(0, 20);
    if (!hexes.length) return json({ ok: false, error: "no_hex" }, 400, cors);

    const cache = caches.default;
    const cacheKey = new Request("https://lifeos-aircraft.cache/aircraft?hex=" + hexes.join(","));
    const hit = await cache.match(cacheKey);
    if (hit) return json(await hit.text(), 200, { ...cors, "X-Relay-Cache": "hit" });

    // Ask every feed at once: they use different receiver networks, so together they see more.
    const results = await Promise.allSettled(FEEDS.map(async (base) => {
      const r = await fetch(base + hexes.join(","), {
        headers: { "User-Agent": "LifeOS-aircraft-relay/1.0", Accept: "application/json" },
      });
      if (!r.ok) throw new Error(new URL(base).host + ": HTTP " + r.status);
      const d = await r.json();
      return { host: new URL(base).host, ac: d.ac || d.aircraft || [] };
    }));

    const best = new Map();   // hex -> freshest position report across feeds
    const sources = [];
    const errors = [];
    for (const res of results) {
      if (res.status !== "fulfilled") { errors.push(String(res.reason && res.reason.message || res.reason)); continue; }
      sources.push(res.value.host);
      for (const a of res.value.ac) {
        if (typeof a.lat !== "number") continue;
        const hex = String(a.hex || "").toLowerCase().replace("~", "");
        const prev = best.get(hex);
        if (!prev || (+a.seen_pos || 0) < (+prev.seen_pos || 0)) best.set(hex, a);
      }
    }
    if (sources.length) {
      const ac = [...best.values()].map((a) => {
        const o = {};
        for (const k of KEEP) if (k in a) o[k] = a[k];
        return o;
      });
      const body = JSON.stringify({ ok: true, source: sources.join(" + "), now: Date.now() / 1000, ac });
      ctx.waitUntil(cache.put(cacheKey, new Response(body, {
        headers: { "Content-Type": "application/json", "Cache-Control": "max-age=" + CACHE_SECONDS },
      })));
      return json(body, 200, cors);
    }
    return json({ ok: false, error: "feeds_unavailable", detail: errors }, 502, cors);
  },
};
