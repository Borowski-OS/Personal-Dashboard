# Aircraft relay (Who's flying)

The Flying tab's **Who's flying** map gets live positions from the free ADS-B feeds
(adsb.fi and adsb.lol). Those feeds don't let web pages call them directly, so this tiny
Cloudflare Worker fetches them for the page. It holds no keys and no personal data: the
page sends the transponder codes it wants, and the Worker returns only position fields.
It only answers pages on `borowski-os.github.io` (and localhost for testing).

Free Cloudflare plan: 100,000 requests/day. One open Flying tab uses about 240/hour.

## Deploy / update

```bash
cd relay
npx wrangler@4 login     # once: opens the browser to approve access to your Cloudflare account
npx wrangler@4 deploy
```

`deploy` prints the Worker URL (`https://lifeos-aircraft.<your-subdomain>.workers.dev`).
The dashboard uses `<that URL>/aircraft`, set as `AT_RELAY` in `index.html`
(or override it with Config key `aircraft_relay_url` in the sheet).

## Which planes

Flying sheet key `tracked_aircraft`, e.g.

```
N51207 = Brad & Chelsea; N6058A = Mike; N3207A; N6489X
```

Tail numbers only (US N-numbers). Without that key the page tracks `AT_DEFAULT_TAILS`.

## Test locally

```bash
npx wrangler@4 dev --port 8787
curl "http://localhost:8787/aircraft?hex=a66b55"
```
